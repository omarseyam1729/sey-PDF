import { CloseIcon } from './icons';

export type Notice = { id: string; message: string };

type Props = {
  notices: Notice[];
  onDismiss: (id: string) => void;
};

export function Notices({ notices, onDismiss }: Props) {
  if (notices.length === 0) return null;
  return (
    <div role="status" className="fixed right-4 bottom-20 z-30 flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-2">
      {notices.map((notice) => (
        <div
          key={notice.id}
          className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 shadow"
        >
          <span className="flex-1 break-words">{notice.message}</span>
          <button
            type="button"
            aria-label="Dismiss"
            className="rounded p-0.5 hover:bg-red-100"
            onClick={() => onDismiss(notice.id)}
          >
            <CloseIcon />
          </button>
        </div>
      ))}
    </div>
  );
}
