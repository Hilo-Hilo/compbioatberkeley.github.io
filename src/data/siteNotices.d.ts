export interface SiteNotice {
  id: string;
  title: string;
  startsAt: string;
  endsAt: string;
  dateLabel: string;
  shortDateLabel: string;
  timeLabel: string;
  description: string;
  url: string;
  linkLabel: string;
}
export function validateNotices(notices: unknown): SiteNotice[];
export function activeNotices(notices: unknown, now?: number): SiteNotice[];
export function renderNoticeGuide(template: string, notices: SiteNotice[]): string;
