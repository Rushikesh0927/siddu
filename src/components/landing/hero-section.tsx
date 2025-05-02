import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const HeroSection = () => {
  return (
    <div className="hero-gradient pt-28 pb-20 md:pt-32 md:pb-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 md:pr-8 text-center md:text-left mb-8 md:mb-0">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              <span className="block">Connect, Learn &</span>
              <span className="text-job-600">Grow Your Career</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8">
              Pay4Skill bridges the gap between students and employers. 
              Find opportunities that match your skills or discover talents 
              for your projects.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center md:justify-start">
              <Link to="/register">
                <Button size="lg" className="bg-job-600 hover:bg-job-700 text-white">
                  Get Started
                </Button>
              </Link>
              <Link to="/browse-jobs">
                <Button size="lg" variant="outline" className="border-job-500 text-job-600 hover:bg-job-50">
                  Browse Jobs
                </Button>
              </Link>
            </div>
          </div>
          <div className="md:w-1/2">
            <img 
              src="/placeholder.svg" 
              alt="Students and employers connecting" 
              className="rounded-lg shadow-xl"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
