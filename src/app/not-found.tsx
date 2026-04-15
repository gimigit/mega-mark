import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center">
      <h1 className="text-6xl font-black text-gray-900 dark:text-white">404</h1>
      <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
        Pagina nu a fost gasita.
      </p>
      <Link
        href="/"
        className="mt-6 bg-green-700 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-800 transition-colors"
      >
        Inapoi la pagina principala
      </Link>
    </div>
  )
}
