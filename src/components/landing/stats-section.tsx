const stats = [
  { value: "5,000+", label: "Students Registered" },
  { value: "500+", label: "Employers" },
  { value: "1,200+", label: "Jobs Posted" },
  { value: "85%", label: "Success Rate" },
];

export const StatsSection = () => {
  return (
    <section className="py-16 bg-job-50 dark:bg-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Impact</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Pay4Skill has helped thousands of students find opportunities and employers discover talent.
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow text-center"
            >
              <p className="text-3xl md:text-4xl font-bold text-job-600 mb-2">{stat.value}</p>
              <p className="text-gray-600 dark:text-gray-300">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
