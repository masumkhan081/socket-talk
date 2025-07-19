// abc
import type { ReactNode } from "react";
import { Link } from "react-router-dom";

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footerText: string;
  footerLink: string;
  footerLinkText: string | React.ReactNode;
}

const AuthLayout = ({
  title,
  subtitle,
  children,
  footerText,
  footerLink,
  footerLinkText,
}: AuthLayoutProps) => {
  return (
    <div className="brdr w-screen min-h-screen bg-gray-200 flex flex-col justify-center items-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {title}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">{subtitle}</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {children}
        </div>

        <div className="mt-6 text-center text-sm text-gray-600">
          {footerText}{" "}
          {typeof footerLinkText === 'string' ? (
            <Link
              to={footerLink}
              className="font-medium text-teal-600 hover:text-teal-500"
            >
              {footerLinkText}
            </Link>
          ) : (
            <span className="font-medium text-teal-600 hover:text-teal-500 cursor-pointer">
              {footerLinkText}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
