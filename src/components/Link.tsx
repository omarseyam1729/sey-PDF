import type { AnchorHTMLAttributes, MouseEvent } from 'react';
import { navigate } from '../lib/router';

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & { to: string };

/** An in-app link that navigates without a page reload. */
export function Link({ to, onClick, ...props }: Props) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    // Leave new-tab and other modified clicks to the browser.
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    navigate(to);
  };

  return <a {...props} href={to} onClick={handleClick} />;
}
