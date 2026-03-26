import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import axiosWrapper from "../../utils/AxiosWrapper";
import Heading from "../../components/Heading";
import CustomButton from "../../components/CustomButton";

const Library = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddBook, setShowAddBook] = useState(false);
  const [newBook, setNewBook] = useState({ title: "", author: "", isbn: "", category: "", totalCopies: 1 });
  const userToken = localStorage.getItem("userToken");

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const response = await axiosWrapper.get("library/book/all", {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      if (response.data.success) setBooks(response.data.data);
    } catch (error) {
      toast.error("Failed to load books");
    } finally {
      setLoading(false);
    }
  };

  const handleAddBook = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axiosWrapper.post("library/book/add", {
        ...newBook,
        availableCopies: newBook.totalCopies
      }, {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      if (response.data.success) {
        toast.success("Book added successfully!");
        setShowAddBook(false);
        setNewBook({ title: "", author: "", isbn: "", category: "", totalCopies: 1 });
        fetchBooks();
      }
    } catch (error) {
      toast.error("Failed to add book");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  return (
    <div className="w-full mx-auto mt-10 mb-20 px-4">
      <div className="flex justify-between items-center mb-8">
        <Heading title="Library Management" />
        <CustomButton onClick={() => setShowAddBook(!showAddBook)}>
          {showAddBook ? "Close Form" : "Add New Book"}
        </CustomButton>
      </div>

      {showAddBook && (
        <form onSubmit={handleAddBook} className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 max-w-4xl mx-auto mb-12 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input
              type="text"
              placeholder="Book Title"
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none"
              value={newBook.title}
              onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
            />
            <input
              type="text"
              placeholder="Author"
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none"
              value={newBook.author}
              onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
            />
            <input
              type="text"
              placeholder="ISBN"
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none"
              value={newBook.isbn}
              onChange={(e) => setNewBook({ ...newBook, isbn: e.target.value })}
            />
            <input
              type="text"
              placeholder="Category"
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none"
              value={newBook.category}
              onChange={(e) => setNewBook({ ...newBook, category: e.target.value })}
            />
            <input
              type="number"
              placeholder="Total Copies"
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none"
              value={newBook.totalCopies}
              onChange={(e) => setNewBook({ ...newBook, totalCopies: Number(e.target.value) })}
            />
          </div>
          <div className="flex justify-center">
            <CustomButton type="submit" disabled={loading}>Save Book</CustomButton>
          </div>
        </form>
      )}

      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden max-w-7xl mx-auto">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-bold tracking-wider">
              <tr>
                <th className="px-8 py-4">Title</th>
                <th className="px-8 py-4">Author</th>
                <th className="px-8 py-4">ISBN</th>
                <th className="px-8 py-4">Category</th>
                <th className="px-8 py-4 text-center">Copies (Avail/Total)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {books.map((b) => (
                <tr key={b._id} className="hover:bg-gray-50 transition-colors italic">
                  <td className="px-8 py-5 font-bold text-gray-900">{b.title}</td>
                  <td className="px-8 py-5 text-gray-600">{b.author}</td>
                  <td className="px-8 py-5 text-gray-500 text-sm">{b.isbn}</td>
                  <td className="px-8 py-5">
                    <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold">{b.category}</span>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className={`font-black ${b.availableCopies > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {b.availableCopies}
                    </span>
                    <span className="text-gray-300 mx-1">/</span>
                    <span className="text-gray-900">{b.totalCopies}</span>
                  </td>
                </tr>
              ))}
              {books.length === 0 && !loading && (
                <tr>
                  <td colSpan="5" className="px-8 py-10 text-center text-gray-400 font-medium">No books found in the library.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Library;
