export default function UnauthorizedPage() {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-red-600 mb-4">403 - Akses Ditolak</h1>
        <p className="text-lg text-gray-700">Maaf, role Anda tidak memiliki izin untuk mengakses halaman ini.</p>
      </div>
    </div>
  );
}