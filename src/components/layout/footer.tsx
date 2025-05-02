import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="bg-gray-50 dark:bg-gray-900 pt-12 pb-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Pay4Skill</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Connecting students with opportunities and employers with talent.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-600 dark:text-gray-300 hover:text-job-600 dark:hover:text-job-400">Home</Link></li>
              <li><Link to="/browse-jobs" className="text-gray-600 dark:text-gray-300 hover:text-job-600 dark:hover:text-job-400">Browse Jobs</Link></li>
              <li><Link to="/about" className="text-gray-600 dark:text-gray-300 hover:text-job-600 dark:hover:text-job-400">About Us</Link></li>
              <li><Link to="/contact" className="text-gray-600 dark:text-gray-300 hover:text-job-600 dark:hover:text-job-400">Contact</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">For Users</h3>
            <ul className="space-y-2">
              <li><Link to="/login" className="text-gray-600 dark:text-gray-300 hover:text-job-600 dark:hover:text-job-400">Login</Link></li>
              <li><Link to="/register" className="text-gray-600 dark:text-gray-300 hover:text-job-600 dark:hover:text-job-400">Sign Up</Link></li>
              <li><Link to="/student-dashboard" className="text-gray-600 dark:text-gray-300 hover:text-job-600 dark:hover:text-job-400">Student Dashboard</Link></li>
              <li><Link to="/employer-dashboard" className="text-gray-600 dark:text-gray-300 hover:text-job-600 dark:hover:text-job-400">Employer Dashboard</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <address className="not-italic text-gray-600 dark:text-gray-300">
              <p>Email: info@pay4skill.com</p>
              <p>Phone: +91 123 456 7890</p>
            </address>
          </div>
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
          <p className="text-center text-gray-600 dark:text-gray-300">
            &copy; {new Date().getFullYear()} Pay4Skill. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
