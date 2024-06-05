import Image from "next/image";
import { Inter } from "next/font/google";
import { useLocalStorage } from "usehooks-ts";
import * as Dialog from "@radix-ui/react-dialog";
import * as Toast from "@radix-ui/react-toast";
import { Cross2Icon, PlusCircledIcon } from "@radix-ui/react-icons";
import { useState, useRef, useEffect, useMemo } from "react";
import imageBlobReduce from "image-blob-reduce";
import { debounce } from "lodash";
import { useRouter } from "next/router";

const reducer = imageBlobReduce();

const inter = Inter({ subsets: ["latin"] });

const allPlaces = ["🐻‍❄️ リサの家", "🐻 アンドレの家", "🦁 学校"];
const allGenres = [
  "憲法",
  "行政法",
  "民法",
  "民事訴訟法",
  "会社法",
  "刑法",
  "刑事訴訟法",
  "経済法",
  "その他",
];

export default function Home() {
  const [data, setData, removeData] = useLocalStorage("test-key3", {
    "🐻‍❄️ リサの家": {
      憲法: {
        4: {
          title: "肢別本（憲法）",
          imageKey: "cat1",
          genre: "憲法",
          notes: "アンドレの家に持っていく",
          place: "🐻‍❄️ リサの家",
        },
      },
      行政法: {},
      民法: {},
      民事訴訟法: {},
      会社法: {},
      刑法: {},
      刑事訴訟法: {},
      経済法: {},
      その他: {},
    },
    "🐻 アンドレの家": {
      憲法: {
        2: {
          title: "肢別本（憲法）",
          imageKey: "cat2",
          genre: "憲法",
          notes: "アンドレの家に持っていく",
          place: "🐻 アンドレの家",
        },
      },
      行政法: {},
      民法: {},
      民事訴訟法: {},
      会社法: {},
      刑法: {},
      刑事訴訟法: {},
      経済法: {},
      その他: {},
    },
    "🦁 学校": {
      憲法: {
        3: {
          title: "肢別本（憲法）",
          imageKey: "cat3",
          genre: "憲法",
          notes: "アンドレの家に持っていく",
          place: "🦁 学校",
        },
      },
      行政法: {},
      民法: {},
      民事訴訟法: {},
      会社法: {},
      刑法: {},
      刑事訴訟法: {},
      経済法: {},
      その他: {},
    },
  });

  const [images, setImages] = useState([]);

  const router = useRouter();

  useEffect(() => {
    const imagesObject = Object.entries(data).reduce((acc, [place, genres]) => {
      const placeImages = Object.entries(genres).flatMap(([genre, books]) => {
        const genreImages = Object.entries(books).map(([id, book]) => {
          return book.imageKey;
        });

        return genreImages;
      });

      for (const imageKey of placeImages) {
        acc[imageKey] = false;
      }

      return acc;
    }, {});

    Object.entries(imagesObject).forEach(([imageKey, value]) => {
      if (value) {
        localStorage.setItem(key, value);
      } else {
        const newValue = localStorage.getItem(imageKey);

        imagesObject[imageKey] = newValue;
      }
    });

    setImages(imagesObject);
  }, [data]);

  const [popupOpen, setPopupOpen] = useState(false);
  const [editPopupOpen, setEditPopupOpen] = useState(false);
  const [importDataPopupOpen, setImportDataPopupOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState();
  const [bookToEdit, setBookToEdit] = useState({});

  const handleChangePlace = (newPlace, oldPlace, genre, id) => {
    if (newPlace === oldPlace) {
      return;
    }

    const dataClone = structuredClone(data);
    const book = dataClone[oldPlace][genre][id];
    book["place"] = newPlace;

    dataClone[newPlace][genre][id] = book;
    delete dataClone[oldPlace][genre][id];

    setData(dataClone);
  };

  const handleChangeGenre = (newGenre, oldGenre, place, id) => {
    if (newGenre === oldGenre) {
      return;
    }

    const dataClone = structuredClone(data);
    const book = dataClone[place][oldGenre][id];
    book["genre"] = newGenre;

    dataClone[place][newGenre][id] = book;
    delete dataClone[place][oldGenre][id];

    setData(dataClone);
  };

  const handleAddBook = ({ title, genre, place, image }) => {
    let uuid = self.crypto.randomUUID();
    let imageUuid = self.crypto.randomUUID();

    localStorage.setItem(imageUuid, image);

    const dataClone = structuredClone(data);
    const book = {
      id: uuid,
      title,
      genre,
      place,
      imageKey: imageUuid,
      notes: "",
    };

    dataClone[place][genre][uuid] = book;

    setData(dataClone);
  };

  const handleEditBook = (oldBook, newBook, newImage) => {
    const dataClone = structuredClone(data);

    if (newImage) {
      let imageUuid = self.crypto.randomUUID();
      newBook.imageKey = imageUuid;
      localStorage.setItem(imageUuid, newImage);
      localStorage.removeItem(oldBook.imageKey);
    }

    delete dataClone[oldBook.place][oldBook.genre][oldBook.id];
    dataClone[newBook.place][newBook.genre][oldBook.id] = {
      id: oldBook.id,
      place: newBook.place,
      genre: newBook.genre,
      title: newBook.title,
      imageKey: newBook.imageKey,
    };

    setData(dataClone);
  };

  const handleNotesChange = debounce((newNotes, place, genre, id) => {
    const dataClone = structuredClone(data);
    const book = dataClone[place][genre][id];
    book["notes"] = newNotes;

    setData(dataClone);
  }, 500);

  const handleImportData = (newData) => {
    const dataJson = JSON.parse(newData);

    setData(dataJson.data);

    const images = dataJson.images;

    for (const [key, value] of Object.entries(images)) {
      localStorage.setItem(key, value);
    }

    router.reload();
  };

  const handleExportData = async () => {
    const output = {
      data: data,
      images: images,
    };

    await navigator.clipboard.writeText(JSON.stringify(output));
  };

  const allBooks = useMemo(() => {
    return Object.entries(data).reduce((acc, [placeName, placeData]) => {
      return [
        ...acc,
        ...Object.entries(placeData).reduce((acc, [genreName, genreData]) => {
          return [
            ...acc,
            ...Object.entries(genreData).reduce((acc, [id, book]) => {
              acc.push({
                ...book,
                id,
              });

              return acc;
            }, []),
          ];
        }, []),
      ];
    }, []);
  }, [data]);

  const index = useMemo(() => {
    const index = {};

    for (const book of allBooks) {
      let genreStack = "";

      for (const char of book.genre || "") {
        genreStack = `${genreStack}${char}`;
        if (index[genreStack]) {
          index[genreStack].push(book);
        } else {
          index[genreStack] = [book];
        }
      }

      let titleStack = "";

      for (const char of book.title || "") {
        titleStack = `${titleStack}${char}`;
        if (index[titleStack]) {
          index[titleStack].push(book);
        } else {
          index[titleStack] = [book];
        }
      }

      let placeStack = "";

      for (const char of book.place || "") {
        placeStack = `${placeStack}${char}`;
        if (index[placeStack]) {
          index[placeStack].push(book);
        } else {
          index[placeStack] = [book];
        }
      }

      let notesStack = "";

      for (const char of book.notes || "") {
        notesStack = `${notesStack}${char}`;
        if (index[notesStack]) {
          index[notesStack].push(book);
        } else {
          index[notesStack] = [book];
        }
      }
    }

    return index;
  }, [allBooks]);

  const includedBooks = searchQuery ? index[searchQuery] || [] : allBooks;

  const filteredDataSet = {};

  for (const book of includedBooks) {
    filteredDataSet[book.place] ||= {};
    filteredDataSet[book.place][book.genre] ||= {};
    filteredDataSet[book.place][book.genre][book.id] = book;
  }

  const workingDataSet = searchQuery ? filteredDataSet : data;

  console.log("stuff", searchQuery, includedBooks, workingDataSet);

  return (
    <main
      className={`min-h-screen ${inter.className} flex flex-col items-center xl:p-24 gap-4 m-4`}
    >
      <div className="sticky top-0 bg-slate-100 flex w-dvw -m-4 p-4 border-b mb-0">
        <input
          className="Input"
          id="search"
          placeholder="検索"
          value={searchQuery}
          onChange={(event) => {
            setSearchQuery(event.target.value);
          }}
        />
      </div>
      <div className="flex flex-col items-center w-32 gap-1">
        <EditBookPopup
          handleEditBook={handleEditBook}
          popupOpen={editPopupOpen}
          setPopupOpen={setEditPopupOpen}
          book={bookToEdit}
        />

        <AddBookButton
          handleAddBook={handleAddBook}
          popupOpen={popupOpen}
          setPopupOpen={setPopupOpen}
        />
        {/* <button
          className={`Button violet-primary flex-auto`}
          onMouseDown={handleExportData}
        >
          Export Data
        </button>

        <ImportDataButton
          handleImportData={handleImportData}
          popupOpen={importDataPopupOpen}
          setPopupOpen={setImportDataPopupOpen}
        /> */}
      </div>
      {Object.entries(workingDataSet).map(([place, genres]) => {
        return (
          <div
            key={place}
            className="border rounded-3xl custom-class-card p-4 w-full flex flex-col"
          >
            <div>
              <h2 className="text-4xl font-bold">{place}</h2>
            </div>
            <div className="flex flex-col">
              {Object.entries(genres).map(([genre, books]) => {
                return (
                  <div key={genre}>
                    <div className="text-2xl font-bold w-full border-b border-slate-50">
                      {genre}
                    </div>
                    <div className="px-4">
                      {Object.entries(books).map(
                        ([id, { title, imageKey, genre, notes, place }]) => {
                          return (
                            <div
                              className="flex gap-4 py-4 items-center flex-col sm:flex-row"
                              key={id}
                            >
                              <div className="flex items-center gap-4 w-full sm:w-auto">
                                <div className="flex-initial flex-shrink-0">
                                  {images[imageKey] && (
                                    <Image
                                      src={images[imageKey]}
                                      width={100}
                                      height={200}
                                      alt={title}
                                    />
                                  )}
                                </div>
                                <div className="flex-auto flex flex-col gap-4">
                                  <div className="text-xl font-bold">
                                    {title}
                                  </div>

                                  <div className="flex flex-col gap-4 flex-auto">
                                    <select
                                      className="p-2 rounded-md border-2 border-pink-100"
                                      name="場所"
                                      id="場所"
                                      value={place}
                                      onChange={(event) => {
                                        handleChangePlace(
                                          event.target.value,
                                          place,
                                          genre,
                                          id
                                        );
                                      }}
                                    >
                                      {allPlaces.map((place) => {
                                        return (
                                          <option key={place} value={place}>
                                            {place}
                                          </option>
                                        );
                                      })}
                                    </select>

                                    <select
                                      name="ジャンル"
                                      id="ジャンル"
                                      className="p-2 rounded-md border-2 border-pink-100"
                                      value={genre}
                                      onChange={(event) => {
                                        handleChangeGenre(
                                          event.target.value,
                                          genre,
                                          place,
                                          id
                                        );
                                      }}
                                    >
                                      {allGenres.map((genre) => {
                                        return (
                                          <option key={genre} value={genre}>
                                            {genre}
                                          </option>
                                        );
                                      })}
                                    </select>
                                  </div>
                                </div>
                              </div>

                              <div className="flex flex-col w-full sm:w-auto">
                                <textarea
                                  name="notes"
                                  rows="2"
                                  cols="33"
                                  className="p-2"
                                  onChange={(event) => {
                                    handleNotesChange(
                                      event.target.value,
                                      place,
                                      genre,
                                      id
                                    );
                                  }}
                                >
                                  {notes}
                                </textarea>
                              </div>
                              <div className="flex flex-col gap-4 w-full sm:w-auto">
                                <button
                                  className="Button violet cursor-pointer"
                                  onMouseDown={() => {
                                    setBookToEdit({
                                      id,
                                      title,
                                      imageKey,
                                      genre,
                                      notes,
                                      place,
                                    });
                                    setEditPopupOpen(true);
                                  }}
                                >
                                  編集
                                </button>
                              </div>

                              <div className="border w-full sm:hidden"></div>
                            </div>
                          );
                        }
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
      {/* </div> */}
    </main>
  );
}

function ImportDataButton({ handleImportData, popupOpen, setPopupOpen }) {
  const [data, setData] = useState();

  const [showToast, setShowToast] = useState(false);
  const timerRef = useRef(0);

  const showError = () => {
    setShowToast(true);
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      setShowToast(false);
    }, 2000);
  };

  return (
    <div>
      <Dialog.Root open={popupOpen}>
        <button
          className={`Button violet-primary flex-auto`}
          onMouseDown={() => {
            setPopupOpen(true);
          }}
        >
          Import Data
        </button>
        <Dialog.Portal>
          <Dialog.Overlay className="DialogOverlay" />
          <Dialog.Content className="DialogContent">
            <Dialog.Title className="DialogTitle">
              <h3 className="text-2xl">Import Data</h3>
            </Dialog.Title>
            <fieldset className="Fieldset">
              <label className="Label" htmlFor="title">
                Data
              </label>
              <textarea
                className="Input"
                id="data"
                onChange={(event) => {
                  setData(event.target.value);
                }}
              />
            </fieldset>
            <div
              style={{
                display: "flex",
                marginTop: 25,
                justifyContent: "flex-end",
              }}
            >
              <button
                className="Button green"
                onMouseDown={() => {
                  if (data) {
                    handleImportData(data);
                    setData(undefined);
                    setPopupOpen(false);
                  } else {
                    showError();
                  }
                }}
              >
                Import
              </button>
            </div>
            <Dialog.Close asChild>
              <button
                className="IconButton"
                aria-label="Close"
                onMouseDown={() => {
                  setPopupOpen(false);
                }}
              >
                <Cross2Icon />
              </button>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      <ToastyBoy open={showToast} setOpen={setShowToast} />
    </div>
  );
}

function EditBookPopup({
  handleEditBook,
  book,
  popupOpen,
  setPopupOpen,
  className,
}) {
  const [genre, setGenre] = useState(book.genre);
  const [place, setPlace] = useState(book.place);
  const [title, setTitle] = useState(book.title);
  const [image, setImage] = useState(book.image);
  const [showToast, setShowToast] = useState(false);
  const timerRef = useRef(0);

  useEffect(() => {
    const imageBlob = localStorage.getItem(book.imageKey);

    setGenre(book.genre);
    setPlace(book.place);
    setTitle(book.title);
    setImage(imageBlob);
  }, [book]);

  const showError = () => {
    setShowToast(true);
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      setShowToast(false);
    }, 2000);
  };

  const handleImageOnChange = async (event) => {
    if (event.target.files && event.target.files[0]) {
      const blob = await reducer.toBlob(event.target.files[0], {
        max: 200,
        unsharpAmount: 80,
        unsharpRadius: 0.6,
        unsharpThreshold: 2,
      });

      let reader = new FileReader();

      reader.onload = (e) => {
        setImage(e.target.result);
      };

      reader.readAsDataURL(blob);
    }
  };

  return (
    <div>
      <Dialog.Root open={popupOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="DialogOverlay" />
          <Dialog.Content className="DialogContent">
            <Dialog.Title className="DialogTitle">
              <h3 className="text-2xl">本の編集</h3>
            </Dialog.Title>
            <fieldset className="Fieldset">
              <label className="Label" htmlFor="title">
                タイトル
              </label>
              <input
                className="Input"
                id="title"
                placeholder="タイトル"
                value={title}
                onChange={(event) => {
                  setTitle(event.target.value);
                }}
              />
            </fieldset>
            <fieldset className="Fieldset">
              <label className="Label" htmlFor="genre-form">
                ジャンル
              </label>
              <select
                className="Input"
                id="genre-form"
                name="ジャンル"
                value={genre}
                onChange={(event) => {
                  setGenre(event.target.value);
                }}
              >
                <option key={"default"}>選択</option>
                {allGenres.map((genre) => {
                  return (
                    <option key={genre} value={genre}>
                      {genre}
                    </option>
                  );
                })}
              </select>
            </fieldset>
            <fieldset className="Fieldset">
              <label className="Label" htmlFor="place-form">
                場所
              </label>
              <select
                className="Input"
                id="place-form"
                name="場所"
                value={place}
                onChange={(event) => {
                  setPlace(event.target.value);
                }}
              >
                <option key={"default"}>選択</option>
                {allPlaces.map((place) => {
                  return (
                    <option key={place} value={place}>
                      {place}
                    </option>
                  );
                })}
              </select>
            </fieldset>
            <fieldset className="Fieldset">
              <label className="Label" htmlFor="image-form">
                イメージ
              </label>
              <input
                type="file"
                id="image-form"
                className="Input InputFile"
                onChange={handleImageOnChange}
              />
            </fieldset>
            {image && (
              <div className="flex justify-center">
                <Image
                  src={image}
                  width={100}
                  height={200}
                  alt="Image preview"
                />
              </div>
            )}
            <div
              style={{
                display: "flex",
                marginTop: 25,
                justifyContent: "flex-end",
              }}
              className="gap-4"
            >
              <button
                className="Button"
                onMouseDown={() => {
                  setPopupOpen(false);
                }}
              >
                キャンセル
              </button>
              <button
                className="Button green"
                onMouseDown={() => {
                  if (title && place && genre && image) {
                    handleEditBook(
                      book,
                      { id: book.id, title, place, genre },
                      image
                    );
                    setGenre(undefined);
                    setPlace(undefined);
                    setTitle(undefined);
                    setImage(undefined);
                    setPopupOpen(false);
                  } else {
                    showError();
                  }
                }}
              >
                編集
              </button>
            </div>
            <Dialog.Close asChild>
              <button
                className="IconButton"
                aria-label="Close"
                onMouseDown={() => {
                  setPopupOpen(false);
                }}
              >
                <Cross2Icon />
              </button>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      <ToastyBoy open={showToast} setOpen={setShowToast} />
    </div>
  );
}

function AddBookButton({ handleAddBook, popupOpen, setPopupOpen, className }) {
  const [genre, setGenre] = useState();
  const [place, setPlace] = useState();
  const [title, setTitle] = useState();
  const [image, setImage] = useState();
  const [showToast, setShowToast] = useState(false);
  const timerRef = useRef(0);

  const showError = () => {
    setShowToast(true);
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      setShowToast(false);
    }, 2000);
  };

  const handleImageOnChange = async (event) => {
    if (event.target.files && event.target.files[0]) {
      const blob = await reducer.toBlob(event.target.files[0], {
        max: 200,
        unsharpAmount: 80,
        unsharpRadius: 0.6,
        unsharpThreshold: 2,
      });

      let reader = new FileReader();

      reader.onload = (e) => {
        setImage(e.target.result);
      };

      reader.readAsDataURL(blob);
    }
  };

  return (
    <div>
      <Dialog.Root open={popupOpen}>
        <button
          className={`Button violet-primary ${className}`}
          onMouseDown={() => {
            setPopupOpen(true);
          }}
        >
          <PlusCircledIcon className="mr-1" width={20} height={20} />
          追加
        </button>
        <Dialog.Portal>
          <Dialog.Overlay className="DialogOverlay" />
          <Dialog.Content className="DialogContent">
            <Dialog.Title className="DialogTitle">
              <h3 className="text-2xl">本の追加</h3>
            </Dialog.Title>
            <fieldset className="Fieldset">
              <label className="Label" htmlFor="title">
                タイトル
              </label>
              <input
                className="Input"
                id="title"
                placeholder="タイトル"
                onChange={(event) => {
                  setTitle(event.target.value);
                }}
              />
            </fieldset>
            <fieldset className="Fieldset">
              <label className="Label" htmlFor="genre-form">
                ジャンル
              </label>
              <select
                className="Input"
                id="genre-form"
                name="ジャンル"
                onChange={(event) => {
                  setGenre(event.target.value);
                }}
              >
                <option key={"default"}>選択</option>
                {allGenres.map((genre) => {
                  return (
                    <option key={genre} value={genre}>
                      {genre}
                    </option>
                  );
                })}
              </select>
            </fieldset>
            <fieldset className="Fieldset">
              <label className="Label" htmlFor="place-form">
                場所
              </label>
              <select
                className="Input"
                id="place-form"
                name="場所"
                onChange={(event) => {
                  setPlace(event.target.value);
                }}
              >
                <option key={"default"}>選択</option>
                {allPlaces.map((place) => {
                  return (
                    <option key={place} value={place}>
                      {place}
                    </option>
                  );
                })}
              </select>
            </fieldset>
            <fieldset className="Fieldset">
              <label className="Label" htmlFor="image-form">
                イメージ
              </label>
              <input
                type="file"
                id="image-form"
                className="Input InputFile"
                onChange={handleImageOnChange}
              />
            </fieldset>
            {image && (
              <div className="flex justify-center">
                <Image
                  src={image}
                  width={100}
                  height={200}
                  alt="Image preview"
                />
              </div>
            )}
            <div
              style={{
                display: "flex",
                marginTop: 25,
                justifyContent: "flex-end",
              }}
              className="gap-4"
            >
              <button
                className="Button"
                onMouseDown={() => {
                  setPopupOpen(false);
                }}
              >
                キャンセル
              </button>
              <button
                className="Button green"
                onMouseDown={() => {
                  if (title && place && genre && image) {
                    handleAddBook({ title, place, genre, image });
                    setGenre(undefined);
                    setPlace(undefined);
                    setTitle(undefined);
                    setImage(undefined);
                    setPopupOpen(false);
                  } else {
                    showError();
                  }
                }}
              >
                登録
              </button>
            </div>
            <Dialog.Close asChild>
              <button
                className="IconButton"
                aria-label="Close"
                onMouseDown={() => {
                  setPopupOpen(false);
                }}
              >
                <Cross2Icon />
              </button>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      <ToastyBoy open={showToast} setOpen={setShowToast} />
    </div>
  );
}

function ToastyBoy({ open, setOpen }) {
  return (
    <Toast.Provider swipeDirection="right">
      <Toast.Root className="ToastRoot" open={open} onOpenChange={setOpen}>
        <Toast.Title className="ToastTitle">エラー</Toast.Title>
        <Toast.Description asChild>エラーが発生しました</Toast.Description>
        <Toast.Action
          className="ToastAction"
          asChild
          altText="Goto schedule to undo"
        >
          <button className="Button small red">Error</button>
        </Toast.Action>
      </Toast.Root>
      <Toast.Viewport className="ToastViewport" />
    </Toast.Provider>
  );
}
