'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-[#16110D] text-[#EDE7DF] flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-2xl font-serif mb-3">Ha ocurrido un error inesperado</h1>
      <p className="text-xs text-[#A89A8A] mb-6 font-mono max-w-md break-words">
        {error?.message || 'Error del sistema'}
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="px-4 py-2 rounded-lg bg-[#3D2C1E] hover:bg-[#4D3827] text-white text-xs font-serif border border-[#6B4E35] transition-colors cursor-pointer"
      >
        Reintentar
      </button>
    </div>
  );
}
