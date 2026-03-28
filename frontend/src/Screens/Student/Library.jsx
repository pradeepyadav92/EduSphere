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
        axiosWrapper.get("library/book/all", {
          headers: { Authorization: `Bearer ${userToken}` },
        }),
        axiosWrapper.get(`library/student/${userData._id}`, {
          headers: { Authorization: `Bearer ${userToken}` },
        }),
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

  const filteredBooks = books.filter(
    (book) =>
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="mx-auto w-full max-w-7xl space-y-10 px-3 py-4 md:px-5 md:py-6">
      <div>
        <Heading title="Library Catalog" />
        <div className="mx-auto mt-6 max-w-2xl">
          <input
            type="text"
            placeholder="Search by title, author, or category..."
            className="w-full rounded-[18px] border border-[#dfe8fb] bg-white px-6 py-3.5 text-sm text-[#4f638f] outline-none shadow-[0_12px_30px_rgba(37,71,154,0.06)] transition-all placeholder:text-[#9aacce]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-[22px] bg-white text-sm font-medium italic text-[#8090b3] shadow-[0_12px_30px_rgba(37,71,154,0.06)]">
          Syncing with library database...
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredBooks.map((book) => (
              <div
                key={book._id}
                className="group rounded-[22px] border border-[#e1e9fc] bg-white p-6 shadow-[0_12px_30px_rgba(37,71,154,0.06)] transition-all hover:shadow-[0_18px_36px_rgba(37,71,154,0.09)]"
              >
                <div className="mb-4 flex items-start justify-between">
                  <span className="rounded-full bg-[#eef3ff] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-[#4262ae]">
                    {book.category}
                  </span>
                  <span
                    className={`text-[11px] font-medium ${
                      book.availableCopies > 0
                        ? "text-[#118c88]"
                        : "text-[#d55a5a]"
                    }`}
                  >
                    {book.availableCopies > 0 ? "Available" : "Out of Stock"}
                  </span>
                </div>
                <h3 className="mb-2 text-xl font-semibold tracking-[-0.02em] text-[#24365f] transition-colors group-hover:text-[#21439c]">
                  {book.title}
                </h3>
                <p className="mb-6 text-sm text-[#6d7ea4]">by {book.author}</p>
                <div className="flex items-center justify-between border-t border-[#edf2ff] pt-5 text-sm">
                  <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-[#97a6c5]">
                    ISBN: {book.isbn}
                  </span>
                  <span className="rounded-[10px] bg-[#f6f8ff] px-3 py-1 text-sm font-medium text-[#24365f]">
                    {book.availableCopies} Left
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div>
            <Heading title="My Borrowed Books" />
            <div className="mt-8 overflow-hidden rounded-[22px] border border-[#e1e9fc] bg-white shadow-[0_12px_30px_rgba(37,71,154,0.06)]">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-[#123d8f] text-xs font-bold uppercase tracking-[0.2em] text-white/90">
                    <tr>
                      <th className="px-8 py-4">Book Title</th>
                      <th className="px-8 py-4">Issue Date</th>
                      <th className="px-8 py-4">Due Date</th>
                      <th className="px-8 py-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#edf2ff]">
                    {myIssues.map((issue) => (
                      <tr key={issue._id} className="transition-colors hover:bg-[#f7faff]">
                        <td className="px-8 py-5 font-medium text-[#223964]">
                          {issue.book?.title}
                        </td>
                        <td className="px-8 py-5 text-[#5d6f95]">
                          {new Date(issue.issueDate).toLocaleDateString()}
                        </td>
                        <td className="px-8 py-5 font-medium text-[#d55a5a]">
                          {new Date(issue.dueDate).toLocaleDateString()}
                        </td>
                        <td className="px-8 py-5">
                          <span
                            className={`rounded-full px-3 py-1 text-[10px] font-medium uppercase tracking-[0.14em] ${
                              issue.status === "Returned"
                                ? "bg-[#dff6f4] text-[#118c88]"
                                : issue.status === "Issued"
                                ? "bg-[#e8efff] text-[#21439c]"
                                : "bg-[#ffe7e7] text-[#d55a5a]"
                            }`}
                          >
                            {issue.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {myIssues.length === 0 && (
                      <tr>
                        <td
                          colSpan="4"
                          className="px-8 py-10 text-center font-medium text-[#8fa1c5]"
                        >
                          You haven't borrowed any books yet.
                        </td>
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
