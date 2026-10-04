import type { SVGProps } from 'react';

function Icon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="size-4"
      {...props}
    />
  );
}

export const RotateIcon = () => (
  <Icon>
    <path d="M21 12a9 9 0 1 1-3-6.7L21 8" />
    <path d="M21 3v5h-5" />
  </Icon>
);

export const DuplicateIcon = () => (
  <Icon>
    <rect x="9" y="9" width="12" height="12" rx="2" />
    <path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1" />
  </Icon>
);

export const TrashIcon = () => (
  <Icon>
    <path d="M3 6h18" />
    <path d="M8 6V4h8v2" />
    <path d="M19 6l-1 14H6L5 6" />
  </Icon>
);

export const CheckIcon = () => (
  <Icon strokeWidth={3} className="size-3">
    <path d="M5 12l5 5L20 7" />
  </Icon>
);

export const CloseIcon = () => (
  <Icon>
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </Icon>
);

export const MergeIcon = () => (
  <Icon>
    <path d="M7 4v4a5 5 0 0 0 5 5 5 5 0 0 0 5-5V4" />
    <path d="M12 13v7" />
    <path d="m9 17 3 3 3-3" />
  </Icon>
);

export const SplitIcon = () => (
  <Icon>
    <circle cx="6" cy="6" r="3" />
    <circle cx="6" cy="18" r="3" />
    <path d="M20 4 8.12 15.88" />
    <path d="M14.47 14.48 20 20" />
    <path d="M8.12 8.12 12 12" />
  </Icon>
);

export const OrganiseIcon = () => (
  <Icon>
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </Icon>
);

export const CompressIcon = () => (
  <Icon>
    <path d="m15 15 6 6m-6-6v4.8m0-4.8h4.8" />
    <path d="M9 19.8V15m0 0H4.2M9 15l-6 6" />
    <path d="M15 4.2V9m0 0h4.8M15 9l6-6" />
    <path d="M9 4.2V9m0 0H4.2M9 9 3 3" />
  </Icon>
);

export const LockIcon = () => (
  <Icon>
    <rect x="4" y="11" width="16" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </Icon>
);

export const BoltIcon = () => (
  <Icon>
    <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
  </Icon>
);
