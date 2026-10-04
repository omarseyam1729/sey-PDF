import { useEffect, useReducer, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Notices, type Notice } from './components/Notices';
import { navigate, usePath } from './lib/router';
import { clearThumbnails } from './lib/thumbnails';
import { Editor } from './pages/Editor';
import { Landing } from './pages/Landing';
import { initialWorkspace, workspaceReducer } from './store/workspace';
import { findTool } from './tools';

export default function App() {
  const tool = findTool(usePath());
  const [state, dispatch] = useReducer(workspaceReducer, initialWorkspace);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loadingCount, setLoadingCount] = useState(0);

  const notify = (message: string) =>
    setNotices((current) => [...current, { id: crypto.randomUUID(), message }]);

  async function addFiles(files: File[]) {
    setLoadingCount((count) => count + files.length);
    // PDF.js is large; load it on first use so the first page paints fast.
    const { openPdf, renderThumbnails } = await import('./lib/renderPdf');
    // One at a time so pages are appended in the order the files were dropped.
    for (const file of files) {
      try {
        const doc = await openPdf(file);
        const source = { id: crypto.randomUUID(), file, name: file.name, pageCount: doc.numPages };
        dispatch({ type: 'addSource', source });
        renderThumbnails(source.id, doc).catch(() =>
          notify(`Couldn't render previews for ${file.name}.`),
        );
      } catch (err) {
        notify(`${file.name} ${(err as Error).message}`);
      } finally {
        setLoadingCount((count) => count - 1);
      }
    }
  }

  function clearAll() {
    if (!window.confirm('Remove all files and pages from the workspace?')) return;
    dispatch({ type: 'reset' });
    clearThumbnails();
  }

  const { getRootProps, getInputProps, open, isDragActive } = useDropzone({
    accept: { 'application/pdf': ['.pdf'] },
    noClick: true,
    noKeyboard: true,
    onDrop: (accepted, rejected) => {
      rejected.forEach(({ file }) => notify(`${file.name} is not a PDF.`));
      if (accepted.length === 0) return;
      // Files dropped on the landing page open the editor that fits best.
      if (!tool) navigate(accepted.length > 1 ? '/merge' : '/organise');
      void addFiles(accepted);
    },
  });

  useEffect(() => {
    document.title = tool ? `${tool.name} · sey-pdf` : 'sey-pdf · Private PDF tools';
  }, [tool]);

  return (
    <div {...getRootProps({ className: 'outline-none' })}>
      <input {...getInputProps()} />

      {tool ? (
        <Editor
          key={tool.path}
          tool={tool}
          state={state}
          dispatch={dispatch}
          loading={loadingCount > 0}
          onAddFiles={open}
          onClearAll={clearAll}
        />
      ) : (
        <Landing onChooseFiles={open} />
      )}

      <Notices
        notices={notices}
        onDismiss={(id) => setNotices((current) => current.filter((n) => n.id !== id))}
      />

      {isDragActive && (
        <div className="pointer-events-none fixed inset-0 z-40 grid place-items-center bg-blue-500/10 p-6">
          <div className="rounded-2xl border-2 border-dashed border-blue-500 bg-white px-10 py-8 text-lg font-medium text-blue-700 shadow-lg">
            Drop PDFs to open them
          </div>
        </div>
      )}
    </div>
  );
}
