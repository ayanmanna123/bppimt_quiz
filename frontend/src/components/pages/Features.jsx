const features = [
  {
    title: "Safe & Secure",
    description:
      "Your privacy and data are protected with top-notch security measures on our website.",
    points: ["Data encryption", "Secure login", "Trusted platform"],
    image: "/img4.png",
  },
  {
    title: "AI-Powered Features",
    description:
      "Experience smarter quizzes with AI that adapts to your learning needs and provides personalized recommendations.",
    points: ["Smart suggestions", "Adaptive learning", "AI insights"],
    image: "/img5.jpg",
  },
  {
    title: "Certificate on Completion",
    description:
      "Get rewarded for your efforts! Receive a certificate after completing quizzes successfully.",
    points: ["Verified certificate", "Shareable achievement", "Boost your resume"],
    image: "/img7.png",
  },
];

const Features = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-6 space-y-28">
        {features.map((feature, index) => (
          <div
            key={index}
            className={`flex flex-col md:flex-row items-center gap-12 ${
              index % 2 === 1 ? "md:flex-row-reverse" : ""
            }`}
          >
            {/* Left side text */}
            <div className="flex-1">
              <h2 className="text-4xl font-extrabold text-gray-900 mb-6">
                {feature.title}
              </h2>
              <p className="text-lg text-gray-700 mb-6">{feature.description}</p>
              <ul className="space-y-3">
                {feature.points.map((point, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full bg-green-500"></span>
                    <span className="text-lg text-gray-800">{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right side image */}
            <div className="flex-1 flex justify-center">
              <img
                src={feature.image}
                alt={feature.title}
                className="w-80 h-auto drop-shadow-lg"
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Features;
