import React, { useEffect, useMemo, useRef, useState } from 'react';
import axios from '../../services/axios';
import {
  Brain,
  Heart,
  Search,
  Plus,
  Upload,
  X,
  Save,
} from 'lucide-react';
import PatientLayout from './PatientLayout';

const MemoryBook = () => {
  const [memoryPeople, setMemoryPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // =========================================================
  // ADD MEMBER STATES
  // =========================================================

  const [showAddMember, setShowAddMember] = useState(false);
  const [saving, setSaving] = useState(false);

  const [memberName, setMemberName] = useState('');
  const [relationship, setRelationship] = useState('');

  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  const fileInputRef = useRef(null);

  // =========================================================
  // BACKEND URL
  // =========================================================

  const getBackendUrl = () => {
    const baseURL =
      axios.defaults?.baseURL ||
      'http://localhost:5000/api';

    return baseURL.replace(/\/api\/?$/, '');
  };

  // =========================================================
  // GET FULL IMAGE URL
  // =========================================================

  const getImageUrl = (photo) => {
    if (!photo) {
      return 'https://via.placeholder.com/500x500?text=No+Image';
    }

    // Already a complete URL
    if (
      photo.startsWith('http://') ||
      photo.startsWith('https://') ||
      photo.startsWith('blob:')
    ) {
      return photo;
    }

    const backendUrl = getBackendUrl();

    // Backend returns paths such as:
    // /uploads/memory/image.jpg
    if (photo.startsWith('/')) {
      return `${backendUrl}${photo}`;
    }

    return `${backendUrl}/${photo}`;
  };

  // =========================================================
  // FETCH MEMORY BOOK
  // =========================================================

  const fetchMemoryBook = async () => {
    try {
      const res = await axios.get('/memory-book');

      setMemoryPeople(
        Array.isArray(res.data) ? res.data : []
      );
    } catch (error) {
      console.error(
        'Failed to fetch memory book:',
        error
      );

      setMemoryPeople([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemoryBook();
  }, []);

  // =========================================================
  // IMAGE SELECTION
  // =========================================================

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5 MB.');
      return;
    }

    // Revoke previous preview if one exists
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setSelectedImage(file);

    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  };

  // =========================================================
  // RESET FORM
  // =========================================================

  const resetForm = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setMemberName('');
    setRelationship('');
    setSelectedImage(null);
    setImagePreview('');

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // =========================================================
  // CLOSE ADD MEMBER
  // =========================================================

  const handleCloseAddMember = () => {
    if (saving) {
      return;
    }

    resetForm();
    setShowAddMember(false);
  };

  // =========================================================
  // ADD MEMBER
  // =========================================================

  const handleAddMember = async (event) => {
    event.preventDefault();

    if (!memberName.trim()) {
      alert('Please enter the member name.');
      return;
    }

    if (!relationship.trim()) {
      alert('Please enter the relationship.');
      return;
    }

    if (!selectedImage) {
      alert('Please select a member image.');
      return;
    }

    try {
      setSaving(true);

      const formData = new FormData();

      formData.append(
        'name',
        memberName.trim()
      );

      formData.append(
        'relationship',
        relationship.trim()
      );

      formData.append(
        'photo',
        selectedImage
      );

      await axios.post(
        '/memory-book',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      alert('Member added successfully.');

      resetForm();
      setShowAddMember(false);

      setLoading(true);
      await fetchMemoryBook();

    } catch (error) {
      console.error(
        'Failed to add memory member:',
        error
      );

      const message =
        error?.response?.data?.message ||
        'Failed to add member. Please try again.';

      alert(message);
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // SEARCH / FILTER
  // =========================================================

  const filteredPeople = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return memoryPeople;
    }

    return memoryPeople.filter((person) => {
      const name = person.name || '';

      const personRelationship =
        person.relationship || '';

      return `${name} ${personRelationship}`
        .toLowerCase()
        .includes(query);
    });
  }, [memoryPeople, search]);

  // =========================================================
  // UI
  // =========================================================

  return (
    <PatientLayout
      title="Memory Book"
      subtitle="Keep familiar people and meaningful connections easy to remember."
    >
      <div className="space-y-6">

        {/* =====================================================
            HERO SECTION
        ===================================================== */}

        <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-blue-600 via-[#1976f3] to-cyan-500 p-6 text-white shadow-xl shadow-blue-200/60 sm:p-8">

          <div className="absolute -right-12 -top-16 h-52 w-52 rounded-full bg-white/10" />

          <div className="relative z-10 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

            <div className="max-w-2xl">

              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
                <Brain size={24} />
              </div>

              <p className="text-xs font-black uppercase tracking-[1.5px] text-white/70">
                Memory support
              </p>

              <h2 className="mt-1 text-3xl font-black tracking-tight">
                People who matter
              </h2>

              <p className="mt-3 text-sm leading-6 text-white/80">
                Browse familiar faces and relationships in one calm,
                easy-to-use space.
              </p>

            </div>

            <div className="rounded-2xl bg-white/10 px-5 py-4 backdrop-blur-sm">

              <p className="text-3xl font-black">
                {memoryPeople.length}
              </p>

              <p className="text-xs font-bold text-white/70">
                memory entries
              </p>

            </div>

          </div>

        </section>


        {/* =====================================================
            ADD MEMBER
        ===================================================== */}

        <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

          <div>

            <h3 className="text-xl font-black text-slate-800">
              Your Memory Book
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Add familiar people to help keep important memories close.
            </p>

          </div>

          <button
            type="button"
            onClick={() => setShowAddMember(true)}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 hover:shadow-xl active:scale-[0.98]"
          >
            <Plus size={18} />
            Add Member
          </button>

        </section>


        {/* =====================================================
            SEARCH
        ===================================================== */}

        <section className="rounded-[24px] border border-blue-100 bg-white p-4 shadow-sm sm:p-5">

          <div className="relative">

            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search by name or relationship..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm font-semibold outline-none transition placeholder:text-slate-400 hover:border-blue-200 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />

          </div>

        </section>


        {/* =====================================================
            LOADING
        ===================================================== */}

        {loading ? (

          <LoadingCards />

        ) : filteredPeople.length === 0 ? (

          <div className="rounded-[26px] border border-dashed border-slate-200 bg-white p-12 text-center shadow-sm">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-50 text-blue-500">

              <Heart
                size={28}
                fill="currentColor"
              />

            </div>

            <h3 className="mt-5 text-lg font-black text-slate-800">

              {search
                ? 'No matching people'
                : 'No memory entries yet'}

            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">

              {search
                ? 'Try a different name or relationship.'
                : 'Click "Add Member" to add a familiar person to your Memory Book.'}

            </p>

          </div>

        ) : (

          /* ===================================================
              PEOPLE GRID
          =================================================== */

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

            {filteredPeople.map(
              ({
                _id,
                photo,
                name,
                relationship,
              }) => (

                <article
                  key={_id}
                  className="group overflow-hidden rounded-[24px] border border-blue-100 bg-white p-3 shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-xl"
                >

                  {/* PHOTO */}

                  <div className="relative overflow-hidden rounded-[19px] bg-gradient-to-br from-blue-50 to-cyan-50">

                    <img
                      src={getImageUrl(photo)}
                      alt={name || 'Memory'}
                      className="aspect-square w-full object-cover transition duration-500 group-hover:scale-105"
                      onError={(event) => {
                        console.error(
                          'Memory image failed to load:',
                          getImageUrl(photo)
                        );

                        event.currentTarget.src =
                          'https://via.placeholder.com/500x500?text=No+Image';
                      }}
                    />

                    <span className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white/90 text-blue-600 shadow-sm backdrop-blur">

                      <Heart
                        size={17}
                        fill="currentColor"
                      />

                    </span>

                  </div>


                  {/* PERSON DETAILS */}

                  <div className="px-2 pb-2 pt-4">

                    <h3 className="truncate text-lg font-black text-slate-800">
                      {name || 'Unnamed'}
                    </h3>

                    <div className="mt-2 inline-flex items-center rounded-full bg-blue-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-wide text-blue-600">
                      {relationship || 'Family / friend'}
                    </div>

                  </div>

                </article>

              )
            )}

          </div>

        )}

      </div>


      {/* =======================================================
          ADD MEMBER MODAL
      ======================================================= */}

      {showAddMember && (

        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">

          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[28px] bg-white shadow-2xl">

            {/* HEADER */}

            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">

              <div>

                <h2 className="text-xl font-black text-slate-800">
                  Add Memory Member
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Add someone familiar to your Memory Book.
                </p>

              </div>

              <button
                type="button"
                onClick={handleCloseAddMember}
                disabled={saving}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X size={20} />
              </button>

            </div>


            {/* FORM */}

            <form
              onSubmit={handleAddMember}
              className="space-y-5 p-6"
            >

              {/* NAME */}

              <div>

                <label className="mb-2 block text-sm font-black text-slate-700">
                  Member Name
                </label>

                <input
                  type="text"
                  value={memberName}
                  onChange={(e) =>
                    setMemberName(e.target.value)
                  }
                  placeholder="Enter person's name"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-semibold outline-none transition placeholder:text-slate-400 hover:border-blue-200 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />

              </div>


              {/* RELATIONSHIP */}

              <div>

                <label className="mb-2 block text-sm font-black text-slate-700">
                  Relationship
                </label>

                <select
                  value={relationship}
                  onChange={(e) =>
                    setRelationship(e.target.value)
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-semibold outline-none transition hover:border-blue-200 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                >

                  <option value="">
                    Select relationship
                  </option>

                  <option value="Mother">
                    Mother
                  </option>

                  <option value="Father">
                    Father
                  </option>

                  <option value="Son">
                    Son
                  </option>

                  <option value="Daughter">
                    Daughter
                  </option>

                  <option value="Husband">
                    Husband
                  </option>

                  <option value="Wife">
                    Wife
                  </option>

                  <option value="Brother">
                    Brother
                  </option>

                  <option value="Sister">
                    Sister
                  </option>

                  <option value="Grandmother">
                    Grandmother
                  </option>

                  <option value="Grandfather">
                    Grandfather
                  </option>

                  <option value="Friend">
                    Friend
                  </option>

                  <option value="Caregiver">
                    Caregiver
                  </option>

                  <option value="Doctor">
                    Doctor
                  </option>

                  <option value="Other">
                    Other
                  </option>

                </select>

              </div>


              {/* PHOTO */}

              <div>

                <label className="mb-2 block text-sm font-black text-slate-700">
                  Member Photo
                </label>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />

                {imagePreview ? (

                  <div className="relative overflow-hidden rounded-2xl border border-blue-100 bg-blue-50 p-3">

                    <img
                      src={imagePreview}
                      alt="Member preview"
                      className="mx-auto h-52 w-full rounded-xl object-cover"
                    />

                    <button
                      type="button"
                      onClick={() => {
                        if (imagePreview) {
                          URL.revokeObjectURL(
                            imagePreview
                          );
                        }

                        setImagePreview('');
                        setSelectedImage(null);

                        if (fileInputRef.current) {
                          fileInputRef.current.value = '';
                        }
                      }}
                      className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-xl bg-white/95 text-red-500 shadow-md transition hover:bg-white"
                    >
                      <X size={18} />
                    </button>

                  </div>

                ) : (

                  <button
                    type="button"
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                    className="flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50 px-5 py-10 text-center transition hover:border-blue-400 hover:bg-blue-100"
                  >

                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm">

                      <Upload size={24} />

                    </div>

                    <p className="mt-4 text-sm font-black text-slate-700">
                      Choose Photo
                    </p>

                    <p className="mt-1 text-xs font-medium text-slate-500">
                      Select an image from your computer
                    </p>

                  </button>

                )}

              </div>


              {/* BUTTONS */}

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  onClick={handleCloseAddMember}
                  disabled={saving}
                  className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-black text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-sm font-black text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >

                  {saving ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={17} />
                      Save Member
                    </>
                  )}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </PatientLayout>
  );
};


// =========================================================
// LOADING CARDS
// =========================================================

const LoadingCards = () => (

  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

    {Array.from({ length: 4 }).map((_, index) => (

      <div
        key={index}
        className="animate-pulse rounded-[24px] border border-blue-100 bg-white p-3 shadow-sm"
      >

        <div className="aspect-square rounded-[19px] bg-slate-100" />

        <div className="px-2 pb-2 pt-4">

          <div className="h-5 w-2/3 rounded bg-slate-100" />

          <div className="mt-3 h-6 w-1/2 rounded-full bg-slate-100" />

        </div>

      </div>

    ))}

  </div>

);


export default MemoryBook;