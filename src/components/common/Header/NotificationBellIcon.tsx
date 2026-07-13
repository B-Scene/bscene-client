export const NotificationBellIcon = ({ hasUnread }: { hasUnread: boolean }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="25"
    height="25"
    viewBox="0 0 25 25"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M6 20V11C6 7.68629 8.68629 5 12 5C15.3137 5 18 7.68629 18 11V20M6 20H18M6 20H4M18 20H20"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M11 23L13 23"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="4" r="1" stroke="currentColor" strokeWidth="2" />
    {hasUnread ? (
      <circle cx="23" cy="2" r="2" fill="var(--color-primary-400)" />
    ) : null}
  </svg>
);
