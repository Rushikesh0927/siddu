import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white shadow-md dark:bg-gray-900"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-job-600 to-brand-500 bg-clip-text text-transparent">
              Pay4Skill
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-job-600 dark:text-gray-300 dark:hover:text-job-400">
              Home
            </Link>
            <Link to="/browse-jobs" className="text-gray-700 hover:text-job-600 dark:text-gray-300 dark:hover:text-job-400">
              Browse Jobs
            </Link>
            <Link to="/about" className="text-gray-700 hover:text-job-600 dark:text-gray-300 dark:hover:text-job-400">
              About Us
            </Link>
            <Link to="/contact" className="text-gray-700 hover:text-job-600 dark:text-gray-300 dark:hover:text-job-400">
              Contact
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link to="/login">
              <Button variant="outline" className="border-job-500 text-job-600 hover:bg-job-50">
                Log In
              </Button>
            </Link>
            <Link to="/register">
              <Button className="bg-job-600 hover:bg-job-700 text-white">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
