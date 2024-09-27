import React, { useRef, useState } from "react";
import Image from "next/image";
import html2canvas from "html2canvas";

interface MenuItem {
  name: string;
  price: string;
  image: string;
}

interface MenuSection {
  name: string;
  items: MenuItem[];
}

interface MenuData {
  name: string;
  restaurant: string;
  sections: MenuSection[];
  contact: {
    phone: string;
    address: string;
  };
}

const initialMenuData: MenuData = {
  name: "FOOD MENU",
  restaurant: "Paucek and Lage Restaurant",
  sections: [
    {
      name: "MAIN COURSE",
      items: [
        {
          name: "Cheeseburger",
          price: "$34",
          image: "/api/placeholder/200/200",
        },
        {
          name: "Cheese sandwich",
          price: "$22",
          image: "/api/placeholder/200/200",
        },
        {
          name: "Chicken burgers",
          price: "$23",
          image: "/api/placeholder/200/200",
        },
        {
          name: "Spicy chicken",
          price: "$33",
          image: "/api/placeholder/200/200",
        },
        { name: "Hot dog", price: "$24", image: "/api/placeholder/200/200" },
      ],
    },
    {
      name: "APPETIZERS",
      items: [
        {
          name: "Fruit Salad",
          price: "$13",
          image: "/api/placeholder/200/200",
        },
        { name: "Cocktails", price: "$12", image: "/api/placeholder/200/200" },
        { name: "Nuggets", price: "$14", image: "/api/placeholder/200/200" },
        { name: "Sandwich", price: "$13", image: "/api/placeholder/200/200" },
        {
          name: "French Fries",
          price: "$15",
          image: "/api/placeholder/200/200",
        },
      ],
    },
    {
      name: "BEVERAGES",
      items: [
        { name: "Milk Shake", price: "$3", image: "/api/placeholder/200/200" },
        { name: "Iced Tea", price: "$2", image: "/api/placeholder/200/200" },
        {
          name: "Orange Juice",
          price: "$4",
          image: "/api/placeholder/200/200",
        },
        { name: "Lemon Tea", price: "$3", image: "/api/placeholder/200/200" },
        { name: "Coffee", price: "$5", image: "/api/placeholder/200/200" },
      ],
    },
  ],
  contact: {
    phone: "123-456-7890",
    address: "123 Anywhere St., Any City",
  },
};

const EditableText: React.FC<{
  text: string;
  onSave: (newText: string) => void;
  className?: string;
}> = ({ text, onSave, className = "" }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(text);

  const handleSave = () => {
    onSave(editedText);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <input
        type="text"
        value={editedText}
        onChange={(e) => setEditedText(e.target.value)}
        onBlur={handleSave}
        className={`bg-transparent border-b border-orange-500 focus:outline-none ${className}`}
      />
    );
  }

  return (
    <span onClick={() => setIsEditing(true)} className={className}>
      {text}
    </span>
  );
};

const EditableImage: React.FC<{ src: string; alt: string }> = ({
  src,
  alt,
}) => {
  const [imageSrc, setImageSrc] = useState(src);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageSrc(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="relative group w-full h-40">
      <Image
        src={imageSrc}
        alt={alt}
        layout="fill"
        objectFit="cover"
        className="rounded-lg"
      />
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-50 rounded-lg">
        <label className="cursor-pointer text-white p-2 rounded bg-orange-500 hover:bg-orange-600 transition-colors">
          Upload Image
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </label>
      </div>
    </div>
  );
};

const MenuItem: React.FC<{
  item: MenuItem;
  onUpdate: (field: keyof MenuItem, value: string) => void;
}> = ({ item, onUpdate }) => {
  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg transition-transform hover:scale-105">
      <EditableImage src={item.image} alt={item.name} />
      <div className="p-4">
        <h4 className="text-xl font-semibold mb-2">
          <EditableText
            text={item.name}
            onSave={(newText) => onUpdate("name", newText)}
          />
        </h4>
        <p className="text-orange-500 font-bold">
          <EditableText
            text={item.price}
            onSave={(newText) => onUpdate("price", newText)}
          />
        </p>
      </div>
    </div>
  );
};

const Menu: React.FC<{ initialMenuData: MenuData }> = ({ initialMenuData }) => {
  const [menuData, setMenuData] = useState<MenuData>(initialMenuData);
  const menuRef = useRef<HTMLDivElement>(null);

  const updateMenuData = (newData: Partial<MenuData>) => {
    setMenuData((prevData) => ({ ...prevData, ...newData }));
  };

  const updateSectionItem = (
    sectionIndex: number,
    itemIndex: number,
    field: keyof MenuItem,
    value: string
  ) => {
    const newSections = [...menuData.sections];
    newSections[sectionIndex].items[itemIndex][field] = value;
    updateMenuData({ sections: newSections });
  };

  const exportAsImage = async () => {
    if (menuRef.current) {
      const canvas = await html2canvas(menuRef.current);
      const image = canvas.toDataURL("image/png", 1.0);
      const link = document.createElement("a");
      link.download = "menu.png";
      link.href = image;
      link.click();
    }
  };

  return (
    <div className="bg-gray-900 text-white p-8 font-sans min-h-screen">
      <div className="max-w-6xl mx-auto" ref={menuRef}>
        <header className="text-center mb-12">
          <h1 className="text-6xl font-bold mb-4 text-orange-500">
            <EditableText
              text={menuData.name}
              onSave={(newText) => updateMenuData({ name: newText })}
            />
          </h1>
          <h2 className="text-2xl italic">
            <EditableText
              text={menuData.restaurant}
              onSave={(newText) => updateMenuData({ restaurant: newText })}
            />
          </h2>
        </header>

        {menuData.sections.map((section, sectionIndex) => (
          <div key={section.name} className="mb-16">
            <h3 className="text-3xl font-bold mb-8 bg-orange-500 inline-block px-6 py-2 rounded-full">
              <EditableText
                text={section.name}
                onSave={(newText) => {
                  const newSections = [...menuData.sections];
                  newSections[sectionIndex].name = newText;
                  updateMenuData({ sections: newSections });
                }}
              />
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {section.items.map((item, itemIndex) => (
                <MenuItem
                  key={item.name}
                  item={item}
                  onUpdate={(field, value) =>
                    updateSectionItem(sectionIndex, itemIndex, field, value)
                  }
                />
              ))}
            </div>
          </div>
        ))}

        <footer className="mt-16 text-center bg-gray-800 py-8 rounded-lg">
          <p className="text-xl mb-2">
            <EditableText
              text={menuData.contact.phone}
              onSave={(newText) =>
                updateMenuData({
                  contact: { ...menuData.contact, phone: newText },
                })
              }
              className="text-orange-500"
            />
          </p>
          <p className="text-lg">
            <EditableText
              text={menuData.contact.address}
              onSave={(newText) =>
                updateMenuData({
                  contact: { ...menuData.contact, address: newText },
                })
              }
            />
          </p>
        </footer>
      </div>
      <div className="mt-8 text-center">
        <button
          onClick={exportAsImage}
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded transition-colors"
        >
          Export as Image
        </button>
      </div>
    </div>
  );
};

export default Menu;
