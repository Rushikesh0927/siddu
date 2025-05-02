const testimonials = [
  {
    quote: "Pay4Skill helped me land my first internship. The process was easy and the employers were genuine.",
    name: "Priya Sharma",
    role: "Computer Science Student",
  },
  {
    quote: "As an employer, I've found some of the brightest talent through this platform. Highly recommended!",
    name: "Rajesh Kumar",
    role: "Tech Startup Founder",
  },
  {
    quote: "The quality of applicants we receive through Pay4Skill has been exceptional. Our hiring process is much more efficient now.",
    name: "Anita Desai",
    role: "HR Manager",
  },
];

export const TestimonialsSection = () => {
  return (
    <section className="py-16 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">What People Say</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Hear from students who found opportunities and employers who discovered talent.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index} 
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md card-hover border border-gray-100 dark:border-gray-700"
            >
              <div className="mb-4">
                <svg className="h-8 w-8 text-job-400" fill="currentColor" viewBox="0 0 32 32">
                  <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                </svg>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">{testimonial.quote}</p>
              <div className="font-semibold">{testimonial.name}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
