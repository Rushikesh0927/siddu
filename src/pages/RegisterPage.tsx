
import AuthForm from "@/components/auth/auth-form";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";

const RegisterPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow flex items-center justify-center py-16 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="w-full max-w-md">
          <AuthForm type="register" />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RegisterPage;
