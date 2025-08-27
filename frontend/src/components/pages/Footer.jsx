import Counter from "./Counter";

const Footer = () => {
  return (
    <footer className="bg-white py-10 mt-10">
      <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
        {/* Counter 1 */}
        <div className="flex flex-col items-center">
          <span className="text-4xl font-extrabold text-blue-600">
            <Counter from={0} to={1200} duration={8} />+
          </span>
          <p className="text-gray-600 mt-2">Mock Tests Attempted</p>
        </div>

        {/* Counter 2 */}
        <div className="flex flex-col items-center">
          <span className="text-4xl font-extrabold text-green-600">
            <Counter from={0} to={500} duration={8} />+
          </span>
          <p className="text-gray-600 mt-2">Active Students</p>
        </div>

        {/* Counter 3 */}
        <div className="flex flex-col items-center">
          <span className="text-4xl font-extrabold text-purple-600">
            <Counter from={0} to={50} duration={8} />+
          </span>
          <p className="text-gray-600 mt-2">Colleges Connected</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
