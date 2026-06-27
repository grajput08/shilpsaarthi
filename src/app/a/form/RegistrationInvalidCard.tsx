export default function RegistrationInvalidCard({ message }: Readonly<{ message: string }>) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center py-8 lg:py-0">
      <div className="w-full rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm lg:shadow-lg lg:shadow-slate-200/60">
        <p className="text-sm font-medium text-slate-500">Registration link problem</p>
        <p className="mt-3 text-sm text-slate-600" data-testid="form-invalid">
          {message}
        </p>
      </div>
    </div>
  );
}
