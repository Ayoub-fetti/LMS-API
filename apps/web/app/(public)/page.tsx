'use client';

export default function Home() {
  return (
    <div className="bg-white min-h-screen text-foreground">
      {/* --- HERO SECTION --- */}
      <main className="flex flex-col justify-center grow">
        <section className="relative py-20 lg:py-32 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 flex flex-col items-center text-center">
            {/* Heading */}
            <h1 className="text-5xl lg:text-7xl font-extrabold mb-6 leading-tight">
              Unlock Your Potential <br />
              <span className="text-primary italic">with LearnHub.</span>
            </h1>

            {/* Subtext */}
            <p className="max-w-2xl text-lg text-muted mb-10">
              LearnHub is a modern learning platform for professionals.
              Instructors can create courses, manage learners, and track
              progress — while learners gain the skills they need to grow in
              their careers.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <button className="bg-primary text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-primary-hover transition-all shadow-lg hover:shadow-primary/20">
                Explore Courses
              </button>
              <button className="bg-white border border-border text-foreground px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all">
                For Instructors
              </button>
            </div>
          </div>
        </section>

        {/* --- FEATURES SECTION --- */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div>
              <h3 className="text-xl font-semibold mb-2 text-primary">
                Structured Learning
              </h3>
              <p className="text-muted">
                Organized courses and clear paths help learners achieve their
                goals efficiently.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2 text-primary">
                Analytics & Insights
              </h3>
              <p className="text-muted">
                Track performance, monitor progress, and make data-driven
                decisions for better results.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2 text-primary">
                Collaborative Platform
              </h3>
              <p className="text-muted">
                Connect instructors and learners seamlessly to foster engagement
                and growth.
              </p>
            </div>
          </div>
        </section>

        {/* --- CALL TO ACTION SECTION --- */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6 text-foreground">
              Ready to get started?
            </h2>
            <p className="text-lg text-muted mb-8">
              Join LearnHub today and start your journey toward professional
              growth and success.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button className="bg-primary text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-primary-hover transition-all shadow-lg hover:shadow-primary/20">
                Sign Up as Learner
              </button>
              <button className="bg-white border border-border text-foreground px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all">
                Sign Up as Instructor
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
