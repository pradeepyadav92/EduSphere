import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axiosWrapper from "../../utils/AxiosWrapper";
import Heading from "../../components/Heading";

const Library = () => {
  const [books, setBooks] = useState([]);
  const [myIssues, setMyIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const userData = useSelector((state) => state.userData);
  const userToken = localStorage.getItem("userToken");

  const fetchData = async () => {
    if (!userData?._id) return;
    setLoading(true);
    try {
      const [booksRes, issuesRes] = await Promise.all([
        axiosWrapper.get("library/book/all", { headers: { Authorization: `Bearer ${userToken}` } }),
        axiosWrapper.get(`library/student/${userData._id}`, { headers: { Authorization: `Bearer ${userToken}` } })
      ]);
      if (booksRes.data.success) setBooks(booksRes.data.data);
      if (issuesRes.data.success) setMyIssues(issuesRes.data.data);
    } catch (error) {
      console.error("Failed to fetch library data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userData]);

  const filteredBooks = books.filter(b => 
    b.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full mx-auto mt-10 mb-20 px-4 space-y-12">
      <div>
        <Heading title="Library Catalog" />
        <div className="max-w-2xl mx-auto mt-6">
          <input
            type="text"
            placeholder="Search by title, author, or category..."
            className="w-full px-6 py-4 rounded-2xl border border-gray-100 shadow-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all italic text-gray-600"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64 italic text-gray-400">Syncing with library database...</div>
      ) : (
        <>
          {/* Books Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {filteredBooks.map((book) => (
              <div key={book._id} className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 hover:shadow-2xl transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                    {book.category}
                  </span>
                  <span className={`text-xs font-bold ${book.availableCopies > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {book.availableCopies > 0 ? 'Available' : 'Out of Stock'}
                  </span>
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-2 group-hover:text-blue-600 transition-colors uppercase tracking-tight italic">
                  {book.title}
                </h3>
                <p className="text-gray-500 font-medium mb-6">by {book.author}</p>
                <div className="pt-6 border-t border-gray-50 flex justify-between items-center text-sm">
                  <span className="text-gray-400 font-bold tracking-tighter italic">ISBN: {book.isbn}</span>
                  <span className="bg-gray-50 px-3 py-1 rounded-lg text-gray-900 font-black">{book.availableCopies} Left</span>
                </div>
              </div>
            ))}
          </div>

          {/* My Issued Books */}
          <div className="max-w-7xl mx-auto">
            <Heading title="My Borrowed Books" />
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden mt-8">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50/50 text-gray-500 uppercase text-xs font-bold tracking-wider">
                    <tr>
                      <th className="px-8 py-4">Book Title</th>
                      <th className="px-8 py-4">Issue Date</th>
                      <th className="px-8 py-4">Due Date</th>
                      <th className="px-8 py-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 italic">
                    {myIssues.map((issue) => (
                      <tr key={issue._id} className="hover:bg-blue-50/30 transition-colors">
                        <td className="px-8 py-5 font-black text-gray-900 group-hover:text-blue-600 italic">
                          {issue.book?.title}
                        </td>
                        <td className="px-8 py-5 text-gray-600">
                          {new Date(issue.issueDate).toLocaleDateString()}
                        </td>
                        <td className="px-8 py-5 text-rose-600 font-bold">
                          {new Date(issue.dueDate).toLocaleDateString()}
                        </td>
                        <td className="px-8 py-5">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                            issue.status === 'Returned' ? 'bg-emerald-100 text-emerald-700' :
                            issue.status === 'Issued' ? 'bg-blue-100 text-blue-700' : 'bg-rose-100 text-rose-700'
                          }`}>
                            {issue.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {myIssues.length === 0 && (
                      <tr>
                        <td colSpan="4" className="px-8 py-10 text-center text-gray-400 font-medium italic">You haven't borrowed any books yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Library;
