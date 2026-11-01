import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#16110D] text-[#EDE7DF] flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-3xl font-serif mb-4">Página no encontrada</h1>
      <p className="text-sm text-[#A89A8A] mb-6">La página solicitada no está disponible.</p>
      <Link
        href="/"
        className="px-4 py-2 rounded-lg bg-[#3D2C1E] hover:bg-[#4D3827] text-white text-xs font-serif border border-[#6B4E35] transition-colors"
      >
        Volver a La Consulta
      </Link>
    </div>
  );
}
