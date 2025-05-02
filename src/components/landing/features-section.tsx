import { BookOpen, Briefcase, Users } from "lucide-react";

const features = [
  {
    title: "For Students",
    description: "Discover job opportunities tailored to your skills and experience. Apply with ease and track your applications.",
    icon: BookOpen,
  },
  {
    title: "For Employers",
    description: "Post projects and jobs to find skilled students. Review applications and connect with the perfect candidates.",
    icon: Briefcase,
  },
  {
    title: "Community",
    description: "Join a community where education meets industry. Build connections that will benefit your future career.",
    icon: Users,
  },
];

export const FeaturesSection = () => {
  return (
    <section className="py-16 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How Pay4Skill Works</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Our platform makes it easy for students to find opportunities and for employers to discover talent.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md card-hover border border-gray-100 dark:border-gray-700"
            >
              <div className="inline-flex items-center justify-center p-3 bg-job-100 dark:bg-job-900 rounded-lg mb-4">
                <feature.icon className="h-6 w-6 text-job-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
