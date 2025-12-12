import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import logo from '../../assets/imx-logo.jpg';
import Field from '../../components/Field/field';
import Button from '../../components/Button/button';
import { useMutation } from '@tanstack/react-query';
import { login } from '@/components/Api/PostServices';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const signInSchema = z.object({
  email: z.string().min(1, 'Please enter email').email('Enter a valid email').max(30),
  password: z.string().min(1, 'Please enter password').max(35),
});

type SignInFormData = z.infer<typeof signInSchema>;

const SignInForm: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const { mutate, isPending } = useMutation({
    mutationFn: login,
    onSuccess: () => {
      toast.success('Login successful!');
      navigate('/dashboard');
      localStorage.removeItem("hasCheckedIn");
    },
    onError: (err: any) => {
      console.log(err)
      const errorMessage =
        err.response?.data?.message || err.message || 'Login failed. Please try again.';
      setError(errorMessage);
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
  });

  const onSubmit = (data: SignInFormData) => {
    mutate(data);
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-lg rounded-xl px-12 py-10 w-full max-w-md">
        <div className="flex justify-center mb-8">
          <img src={logo} alt="Company Logo" width={160} />
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          {error && (
            <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
          )}

          <div className="space-y-6">
            <Field label="Email" htmlFor="email" error={errors.email?.message}>
              <input
                type="email"
                id="email"
                placeholder="Enter your email"
                {...register('email')}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none"
              />
            </Field>

            <Field label="Password" htmlFor="password" error={errors.password?.message}>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  placeholder="Enter your password"
                  {...register('password')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 focus:outline-none"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.478 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.966 9.966 0 012.063-3.368m1.507-1.507A9.961 9.961 0 0112 5c4.478 0 8.268 2.943 9.542 7a9.973 9.973 0 01-4.615 5.187M3 3l18 18" />
                    </svg>
                  )}
                </button>
              </div>
            </Field>

            <Button type="submit" disabled={isPending} className="w-full !bg-[#2c3445] flex items-center justify-center">
              {isPending ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Sign In'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignInForm;
