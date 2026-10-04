import { BoltIcon, CheckIcon, LockIcon, TrashIcon } from '../components/icons';
import { Link } from '../components/Link';
import { TOOLS, findTool } from '../tools';
import { LandingPreview } from './LandingPreview';

const USE_CASES = [
  {
    title: 'Job and university applications',
    body: "Put your CV, cover letter and certificates into one PDF, then shrink it to fit the portal's upload limit.",
    tools: ['/merge', '/compress'],
  },
  {
    title: 'Expense claims',
    body: 'Collect receipts and invoices from different files into a single PDF, in the order finance wants them.',
    tools: ['/merge', '/organise'],
  },
  {
    title: 'Sharing only what matters',
    body: 'Send the signature pages or one chapter of a long document instead of the whole thing.',
    tools: ['/split'],
  },
  {
    title: 'Cleaning up scans',
    body: 'Turn sideways pages upright, drop blank pages and duplicates, and put everything back in order.',
    tools: ['/organise'],
  },
  {
    title: 'Email attachment limits',
    body: 'Photo-heavy PDFs easily pass the 20–25 MB most email providers accept. Compress them first and see the size up front.',
    tools: ['/compress'],
  },
  {
    title: 'Sensitive documents',
    body: "Contracts, medical records, bank statements and IDs can be edited without handing them to someone else's server.",
    tools: [],
  },
];

const STEPS = [
  { title: 'Drop your PDFs', body: 'They open in this browser tab. Every page appears as a thumbnail.' },
  { title: 'Arrange the pages', body: 'Drag to reorder. Rotate, duplicate, delete or select pages to extract.' },
  { title: 'Export', body: 'See the exact file size, compress if you like, and download your new PDF.' },
];

const PRIVACY_POINTS = [
  {
    icon: LockIcon,
    title: 'Never uploaded',
    body: 'There is no upload step, no file storage and no account. Your PDFs go from your disk to this tab and back.',
  },
  {
    icon: BoltIcon,
    title: 'No waiting on the network',
    body: 'Large scans open straight away because nothing has to travel to a server and back.',
  },
  {
    icon: TrashIcon,
    title: 'Nothing is kept',
    body: "Files only live in this tab's memory. Close or reload the page and they are gone.",
  },
];

const container = 'mx-auto max-w-6xl px-4 sm:px-6';
const ctaButton =
  'rounded-xl bg-neutral-900 px-5 py-3 font-medium text-white shadow-sm hover:bg-neutral-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900';
const sectionTitle = 'text-3xl font-semibold tracking-tight text-balance';
const sectionLead = 'mt-3 max-w-2xl text-lg text-neutral-600';

export function Landing({ onChooseFiles }: { onChooseFiles: () => void }) {
  return (
    <div className="min-h-screen">
      <header className={`${container} flex items-center gap-6 py-5`}>
        <Link to="/" className="mr-auto flex items-center gap-2 text-lg font-semibold tracking-tight">
          <img src="/favicon.svg" alt="" className="size-7" />
          sey-pdf
        </Link>
        <nav aria-label="Sections" className="hidden items-center gap-6 text-sm text-neutral-600 md:flex">
          <a href="#tools" className="hover:text-neutral-900">Tools</a>
          <a href="#use-cases" className="hover:text-neutral-900">Use cases</a>
          <a href="#privacy" className="hover:text-neutral-900">Privacy</a>
        </nav>
        <button type="button" onClick={onChooseFiles} className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700">
          Open PDFs
        </button>
      </header>

      <main>
        <section className={`${container} grid items-center gap-16 pt-8 pb-24 lg:grid-cols-[1fr_1.1fr] lg:pt-16`}>
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700 [&>svg]:size-3.5">
              <LockIcon />
              Your files never leave this device
            </p>
            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
              Private PDF tools that work right in your browser.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-neutral-600">
              sey-pdf merges, splits, reorders and compresses PDFs on your own computer or phone. Nothing is
              uploaded: every page is processed here, in this tab.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-3">
              <button type="button" onClick={onChooseFiles} className={ctaButton}>
                Choose PDFs
              </button>
              <span className="text-sm text-neutral-500">or drop them anywhere on this page</span>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-neutral-600">
              {['No uploads', 'No sign-up', 'No watermarks'].map((item) => (
                <li key={item} className="flex items-center gap-1.5">
                  <span className="grid size-4 place-items-center rounded-full bg-emerald-100 text-emerald-700">
                    <CheckIcon />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <LandingPreview />
        </section>

        <section id="tools" className="scroll-mt-6 border-t border-neutral-200 bg-white">
          <div className={`${container} py-20`}>
            <h2 className={sectionTitle}>Pick a tool</h2>
            <p className={sectionLead}>
              Each tool opens the same page editor, so you can merge, tidy up and compress in one go.
            </p>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {TOOLS.map((tool) => (
                <Link
                  key={tool.path}
                  to={tool.path}
                  className="group flex flex-col rounded-2xl border border-neutral-200 bg-white p-6 transition hover:border-neutral-300 hover:shadow-md"
                >
                  <span className="grid size-10 place-items-center rounded-xl bg-rose-50 text-rose-600 [&>svg]:size-5">
                    <tool.icon />
                  </span>
                  <h3 className="mt-4 font-semibold">{tool.name}</h3>
                  <p className="mt-1 flex-1 text-sm text-neutral-600">{tool.summary}</p>
                  <span className="mt-4 text-sm font-medium text-neutral-900 group-hover:underline">Open →</span>
                </Link>
              ))}
            </div>
            <p className="mt-6 text-sm text-neutral-500">
              Coming next: images to PDF, PDF to images, and adding text, highlights and signatures.
            </p>
          </div>
        </section>

        <section id="use-cases" className="scroll-mt-6">
          <div className={`${container} py-20`}>
            <h2 className={sectionTitle}>What people use it for</h2>
            <p className={sectionLead}>Everyday paperwork, without handing your documents to a website.</p>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {USE_CASES.map((useCase) => (
                <article key={useCase.title} className="flex flex-col rounded-2xl border border-neutral-200 bg-white p-6">
                  <h3 className="font-semibold">{useCase.title}</h3>
                  <p className="mt-2 flex-1 text-sm text-neutral-600">{useCase.body}</p>
                  {useCase.tools.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {useCase.tools.map((path) => (
                        <Link
                          key={path}
                          to={path}
                          className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-200"
                        >
                          {findTool(path)?.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-neutral-200 bg-white">
          <div className={`${container} py-20`}>
            <h2 className={sectionTitle}>How it works</h2>
            <ol className="mt-10 grid gap-8 md:grid-cols-3">
              {STEPS.map((step, i) => (
                <li key={step.title}>
                  <span className="grid size-8 place-items-center rounded-full bg-neutral-900 text-sm font-semibold text-white">
                    {i + 1}
                  </span>
                  <h3 className="mt-4 font-semibold">{step.title}</h3>
                  <p className="mt-1 text-sm text-neutral-600">{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="privacy" className="scroll-mt-6">
          <div className={`${container} grid gap-12 py-20 lg:grid-cols-2`}>
            <div>
              <h2 className={sectionTitle}>Why local matters</h2>
              <p className="mt-4 text-neutral-600">
                Most online PDF tools upload your file, process it on their server and send the result back. For a
                while, a copy of your document sits on a computer you don't control.
              </p>
              <p className="mt-4 text-neutral-600">
                sey-pdf does the work inside your browser with the open-source PDF.js and pdf-lib libraries. The page
                you are reading is the whole app.
              </p>
            </div>
            <ul className="space-y-6">
              {PRIVACY_POINTS.map((point) => (
                <li key={point.title} className="flex gap-4">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-rose-50 text-rose-600 [&>svg]:size-5">
                    <point.icon />
                  </span>
                  <div>
                    <h3 className="font-semibold">{point.title}</h3>
                    <p className="mt-1 text-sm text-neutral-600">{point.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="bg-neutral-900 text-white">
          <div className={`${container} flex flex-col gap-6 py-16 sm:flex-row sm:items-center sm:justify-between`}>
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Got a PDF to fix?</h2>
              <p className="mt-2 text-neutral-400">Drop it anywhere on this page, or choose it from your files.</p>
            </div>
            <button
              type="button"
              onClick={onChooseFiles}
              className="rounded-xl bg-white px-5 py-3 font-medium text-neutral-900 hover:bg-neutral-200"
            >
              Choose PDFs
            </button>
          </div>
        </section>
      </main>

      <footer className={`${container} py-8 text-sm text-neutral-500`}>
        sey-pdf · Private PDF tools · Files stay on your device.
      </footer>
    </div>
  );
}
