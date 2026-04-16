import { Injectable } from '@nestjs/common';
import { spawn } from 'node:child_process';

@Injectable()
export class CommandRunnerService {
  run(
    command: string,
    args: string[] = [],
    options?: {
      cwd?: string;
      timeoutMs?: number;
      env?: NodeJS.ProcessEnv;
    },
  ): Promise<{ code: number; stdout: string; stderr: string }> {
    return new Promise((resolve, reject) => {
      const child = spawn(command, args, {
        cwd: options?.cwd ?? process.cwd(),
        env: { ...process.env, ...options?.env },
        shell: false,
        stdio: ['ignore', 'pipe', 'pipe'],
      });

      let stdout = '';
      let stderr = '';
      let killedByTimeout = false;

      const timeout = setTimeout(() => {
        killedByTimeout = true;
        child.kill('SIGTERM');
      }, options?.timeoutMs ?? 60_000);

      child.stdout.on('data', (chunk: Buffer) => {
        stdout += chunk.toString();
      });

      child.stderr.on('data', (chunk: Buffer) => {
        stderr += chunk.toString();
      });

      child.on('error', (error) => {
        clearTimeout(timeout);
        reject(error);
      });

      child.on('close', (code) => {
        clearTimeout(timeout);

        if (killedByTimeout) {
          reject(
            new Error(`Command timed out: ${command} ${args.join(' ')}`.trim()),
          );
          return;
        }

        resolve({
          code: code ?? 1,
          stdout: stdout.trim(),
          stderr: stderr.trim(),
        });
      });
    });
  }
}
