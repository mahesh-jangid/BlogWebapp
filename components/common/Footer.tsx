'use client';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-white py-8 mt-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* About */}
          <div>
            <h3 className="text-lg font-bold mb-4">📝 BlogHub</h3>
            <p className="text-gray-400">
              A modern blogging platform for sharing your thoughts and ideas with the world.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="/blogs" className="hover:text-white transition">
                  Blogs
                </a>
              </li>
              <li>
                <a href="/categories" className="hover:text-white transition">
                  Categories
                </a>
              </li>
           
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-bold mb-4">Get In Touch</h4>
            <p className="text-gray-400 mb-2">📧 contact@bloghub.com</p>
            <p className="text-gray-400">📞 +919024731575</p>
          </div>
        </div>

        <hr className="border-gray-700" />

      </div>
    </footer>
  );
}
