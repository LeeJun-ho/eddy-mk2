import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { markdownToAdf } from 'marklassian';

type AdfNode = { type: string; text?: string; content?: AdfNode[] };
type JiraCommentBody = string | AdfNode;

@Injectable()
export class JiraService {
  private readonly logger = new Logger(JiraService.name);
  private readonly baseUrl: string;
  private readonly authHeader: string;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl = this.configService.get<string>('jira.baseUrl', '');
    const email = this.configService.get<string>('jira.email', '');
    const apiToken = this.configService.get<string>('jira.apiToken', '');
    this.authHeader = `Basic ${Buffer.from(`${email}:${apiToken}`).toString('base64')}`;
  }

  /**
   * 댓글 페이지 단건 조회
   */
  async getComments(issueKey: string, startAt = 0, maxResults = 100): Promise<{ total: number; comments: { id: string; body: string }[] }> {
    const res = await fetch(
      `${this.baseUrl}/rest/api/3/issue/${issueKey}/comment?startAt=${startAt}&maxResults=${maxResults}`,
      { headers: { Authorization: this.authHeader, Accept: 'application/json' } },
    );

    if (!res.ok) {
      throw new Error(`[JIRA] 댓글 조회 실패: ${res.status} ${await res.text()}`);
    }

    const data = await res.json() as { total: number; comments: { id: string; body: JiraCommentBody }[] };
    return {
      total: data.total,
      comments: data.comments.map((c) => ({ id: c.id, body: this.extractCommentFirstLine(c.body) })),
    };
  }

  /**
   * 전체 댓글 조회 - 페이지네이션을 처리해 모든 댓글을 반환한다.
   */
  async getAllComments(issueKey: string): Promise<{ id: string; body: string }[]> {
    const result: { id: string; body: string }[] = [];
    let startAt = 0;

    while (true) {
      const { total, comments } = await this.getComments(issueKey, startAt);
      result.push(...comments);
      if (comments.length === 0) {
        this.logger.warn(`[JIRA] ${issueKey} 댓글 페이지가 비어 조회를 중단합니다. startAt=${startAt}, total=${total}`);
        break;
      }
      startAt += comments.length;
      if (startAt >= total) break;
    }

    return result;
  }

  /**
   * 댓글 첫 줄의 마커 텍스트로 기존 Bot 댓글 존재 여부를 확인한다.
   */
  async hasCommentWithFirstLineMarker(issueKey: string, marker: string): Promise<boolean> {
    const comments = await this.getAllComments(issueKey);
    const normalizedMarker = this.stripHeading(marker);

    return comments.some((c) => this.stripHeading(c.body) === normalizedMarker);
  }

  /**
   * 댓글 등록 (Markdown -> ADF 변환 후 v3 API로 등록)
   */
  async addComment(issueKey: string, markdown: string): Promise<void> {
    const adfDocument = markdownToAdf(markdown);
    const res = await fetch(`${this.baseUrl}/rest/api/3/issue/${issueKey}/comment`, {
      method: 'POST',
      headers: {
        Authorization: this.authHeader,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ body: adfDocument }),
    });
    const responseText = await res.text();

    if (res.ok) {
      this.logger.log(`[JIRA] ${issueKey} 댓글 등록 완료`);
      return;
    }

    // v3 ADF 입력 검증에 걸리는 경우 v2 plain text로 한 번 더 시도한다.
    if (res.status === 400 && responseText.includes('INVALID_INPUT')) {
      this.logger.warn(`[JIRA] v3 댓글 등록 실패(INVALID_INPUT). v2 plain text로 재시도합니다.`);
      await this.addCommentWithV2(issueKey, markdown);
      return;
    }

  }

  /**
   * ADF 문서의 첫 번째 노드에서 텍스트를 추출한다.
   */
  private extractCommentFirstLine(body: JiraCommentBody): string {
    if (typeof body === 'string') {
      return body.split(/\r?\n/, 1)[0]?.trim() ?? '';
    }

    const firstNode = body?.content?.[0];
    if (!firstNode) return '';
    return this.collectText(firstNode).trim();
  }

  /**
   * ADF 문서의 텍스트를 추출한다.
   */
  private collectText(node: AdfNode): string {
    if (node.type === 'text') return node.text ?? '';
    const children = Array.isArray(node.content) ? node.content : [];
    return children.map((n) => this.collectText(n)).join('');
  }

  /**
   * 마커 비교 전 Markdown 헤더 기호와 공백을 제거해 문자열을 정규화한다.
   */
  private stripHeading(value: string): string {
    return value.replace(/^#{1,6}\s*/, '').trim();
  }

  /**
   * v2 API로 댓글 등록한다.
   */
  private async addCommentWithV2(issueKey: string, body: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/rest/api/2/issue/${issueKey}/comment`, {
      method: 'POST',
      headers: {
        Authorization: this.authHeader,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ body }),
    });
    const responseText = await res.text();

    if (!res.ok) {
      throw new Error(`[JIRA] 댓글 등록(v2 fallback) 실패: ${res.status} ${responseText}`);
    }

    this.logger.log(`[JIRA] ${issueKey} 댓글 등록 완료 (v2 fallback)`);
  }
}
