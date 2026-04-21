import RegisterForm from "@/components/RegisterForm";

export const dynamic = "force-dynamic";

export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-md py-6">
      <RegisterForm />
    </div>
  );
}
