import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JiraService } from './jira.service';

@Module({
  imports: [ConfigModule],
  providers: [JiraService],
  exports: [JiraService],
})
export class JiraModule {}
