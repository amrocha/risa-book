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
    console.log("Calculating images");

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

    console.log("aaa", imagesObject);

    Object.entries(imagesObject).forEach(([imageKey, value]) => {
      if (value) {
        console.log("Saving in storage!", imageKey, value);
        localStorage.setItem(key, value);
      } else {
        console.log("Retrieving from storage!", imageKey, value);
        const newValue = localStorage.getItem(imageKey);

        imagesObject[imageKey] = newValue;
      }
    });

    console.log("bbb", imagesObject);

    setImages(imagesObject);
  }, [data]);

  const [popupOpen, setPopupOpen] = useState(false);
  const [importDataPopupOpen, setImportDataPopupOpen] = useState(false);

  console.log("images", images);

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

    console.log("New image! Saving in storage!", imageUuid, image);
    localStorage.setItem(imageUuid, image);

    const dataClone = structuredClone(data);
    const book = {
      title,
      genre,
      place,
      imageKey: imageUuid,
      notes: "",
    };

    dataClone[place][genre][uuid] = book;

    setData(dataClone);
  };

  const handleNotesChange = debounce((newNotes, place, genre, id) => {
    console.log("New notes! Saving in storage!", {
      newNotes,
      place,
      genre,
      id,
    });

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
      console.log("Saving in storage!", key, value);
      localStorage.setItem(key, value);
    }

    router.reload();
  };

  const handleExportData = async () => {
    console.log("keys", images);

    const output = {
      data: data,
      images: images,
    };

    await navigator.clipboard.writeText(JSON.stringify(output));
    console.log(output);
  };

  return (
    <main
      className={`min-h-screen ${inter.className} flex flex-col items-center justify-between xl:p-24 gap-4 m-4`}
    >
      {/* <div className="flex flex-col items-center justify-between xl:p-24 gap-4"> */}
      <div className="flex flex-col items-center w-32 gap-1">
        <AddBookButton
          handleAddBook={handleAddBook}
          popupOpen={popupOpen}
          setPopupOpen={setPopupOpen}
        />
        <button
          className={`Button violet-primary flex-auto`}
          onClick={handleExportData}
        >
          Export Data
        </button>

        <ImportDataButton
          handleImportData={handleImportData}
          popupOpen={importDataPopupOpen}
          setPopupOpen={setImportDataPopupOpen}
        />
      </div>
      {Object.entries(data).map(([place, genres]) => {
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
                                  rows="5"
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
                                <button className="Button violet cursor-pointer">
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
          onClick={() => {
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
                onClick={() => {
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
                onClick={() => {
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

      // const blobUrl = URL.createObjectURL(blob);
      // setImage(blobUrl);

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
          onClick={() => {
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
            >
              <button
                className="Button green"
                onClick={() => {
                  console.log('Huh!',{
                    title,
                    place,
                    genre,
                    image
                  })
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
                onClick={() => {
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
