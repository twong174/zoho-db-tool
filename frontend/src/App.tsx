import React, { useState, useEffect } from "react";
import CheckIcon from "@mui/icons-material/Check";
import ErrorIcon from "@mui/icons-material/Error";
import SaveIcon from "@mui/icons-material/Save";
import AddIcon from "@mui/icons-material/Add";
import { api } from "./services/api";
import MatchTypeLegend from "./components/MatchTypeLegend";

interface ZohoContact {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  title: string;
  phone: string;
  home_phone: string;
  other_phone: string;
  linkedin_profile: string;
  sector: string;
  mailing_street: string;
  mailing_city: string;
  mailing_state: string;
  mailing_zip: string;
  mailing_country: string;
  company_name: string;
  company_city: string;
  company_state: string;
  company_country: string;
}

interface CCContact {
  id: number;
  first_name: string;
  last_name: string;
  email_address: string;
  job_title: string;
  phone_work: string;
  phone_home: string;
  phone_mobile: string;
  phone_other: string;
  linkedin_profile_url: string;
  sector: string;
  street_home: string;
  city_home: string;
  state_home: string;
  zip_home: string;
  country_home: string;
  company: string;
  city_work: string;
  state_work: string;
  country_work: string;
}

interface FieldMapping {
  cc: keyof CCContact;
  label: string;
}

const ContactComparison: React.FC = () => {
  const [zohoContacts, setZohoContacts] = useState<ZohoContact[]>([]);
  const [ccContacts, setCcContacts] = useState<CCContact[]>([]);
  const [selectedZoho, setSelectedZoho] = useState<ZohoContact | null>(null);
  const [selectedCC, setSelectedCC] = useState<CCContact | null>(null);
  const [editedZoho, setEditedZoho] = useState<Partial<ZohoContact>>({});
  const [showNewContact, setShowNewContact] = useState<boolean>(false);
  const [newContact, setNewContact] = useState<Partial<ZohoContact>>({});
  const [error, setError] = useState<string>("");
  const [zohoSearch, setZohoSearch] = useState<string>("");
  const [ccSearch, setCcSearch] = useState<string>("");

  const fieldMapping: Record<keyof Omit<ZohoContact, "id">, FieldMapping> = {
    first_name: { cc: "first_name", label: "First Name" },
    last_name: { cc: "last_name", label: "Last Name" },
    email: { cc: "email_address", label: "Email" },
    title: { cc: "job_title", label: "Job Title" },
    phone: { cc: "phone_work", label: "Work Phone" },
    home_phone: { cc: "phone_home", label: "Home Phone" },
    other_phone: { cc: "phone_other", label: "Other Phone" },
    linkedin_profile: { cc: "linkedin_profile_url", label: "LinkedIn Profile" },
    sector: { cc: "sector", label: "Sector" },
    mailing_street: { cc: "street_home", label: "Street Address" },
    mailing_city: { cc: "city_home", label: "City (Home)" },
    mailing_state: { cc: "state_home", label: "State (Home)" },
    mailing_zip: { cc: "zip_home", label: "Zip Code (Home)" },
    mailing_country: { cc: "country_home", label: "Country (Home)" },
    company_name: { cc: "company", label: "Company Name" },
    company_city: { cc: "city_work", label: "City (Work)" },
    company_state: { cc: "state_work", label: "State (Work)" },
    company_country: { cc: "country_work", label: "Country (Work)" },
  };

  useEffect(() => {
    loadContactData();
  }, []);

  const loadContactData = async () => {
    try {
      const [zohoResponse, ccResponse] = await Promise.all([
        api.getZohoContacts(),
        api.getConstantContacts(),
      ]);

      const loadedZohoContacts = zohoResponse.data;
      setZohoContacts(loadedZohoContacts);
      if (loadedZohoContacts.length > 0) {
        setSelectedZoho(loadedZohoContacts[0]);
      }

      const loadedCCContacts = ccResponse.data;
      setCcContacts(loadedCCContacts);
      if (loadedCCContacts.length > 0) {
        setSelectedCC(loadedCCContacts[0]);
      }
    } catch (err) {
      setError(
        `Error loading contacts: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    }
  };

  const getFieldValue = (
    contact: ZohoContact | CCContact | null,
    field: Exclude<keyof ZohoContact, "id">,
    isCC: boolean = false
  ): string => {
    if (!contact) return "";
    if (isCC) {
      const ccField = fieldMapping[field]?.cc;
      return String((contact as CCContact)[ccField]) || "";
    }
    return (contact as ZohoContact)[field] || "";
  };

  const normalizeValue = (val: string): string => {
    return String(val || "")
      .trim()
      .toLowerCase();
  };

  // Remove accents and diacritics for normalization
  const removeAccents = (str: string): string => {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  };

  const normalizeWithoutAccents = (val: string): string => {
    return removeAccents(String(val || ""))
      .trim()
      .toLowerCase();
  };

  // Determine match type: 'exact' (green), 'accent-diff' (orange), or 'different' (red)
  const getMatchType = (
    zohoVal: string,
    ccVal: string
  ): "exact" | "accent-diff" | "different" => {
    const zohoNorm = normalizeValue(zohoVal);
    const ccNorm = normalizeValue(ccVal);

    // Both empty - treat as different (no match)
    if (zohoNorm === "" && ccNorm === "") return "different";

    // Exact UTF-8 match
    if (zohoNorm === ccNorm) return "exact";

    // Check if they match when accents are removed
    const zohoNoAccent = normalizeWithoutAccents(zohoVal);
    const ccNoAccent = normalizeWithoutAccents(ccVal);

    if (zohoNoAccent === ccNoAccent && zohoNoAccent !== "")
      return "accent-diff";

    // Different in both UTF-8 and normalized
    return "different";
  };

  const getBackgroundColor = (
    matchType: "exact" | "accent-diff" | "different"
  ): string => {
    switch (matchType) {
      case "exact":
        return "bg-green-50";
      case "accent-diff":
        return "bg-orange-50";
      case "different":
        return "";
    }
  };

  const getHighlightColor = (
    matchType: "exact" | "accent-diff" | "different"
  ): string => {
    switch (matchType) {
      case "exact":
        return "bg-green-100";
      case "accent-diff":
        return "bg-orange-100";
      case "different":
        return "bg-gray-100";
    }
  };

  const getIconColor = (
    matchType: "exact" | "accent-diff" | "different"
  ): string => {
    switch (matchType) {
      case "exact":
        return "text-green-600";
      case "accent-diff":
        return "text-orange-600";
      case "different":
        return "text-red-600";
    }
  };

  const handleZohoEdit = (field: keyof ZohoContact, value: string) => {
    setEditedZoho((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const saveZohoChanges = async () => {
    if (!selectedZoho) return;

    try {
      const response = await api.updateZohoContact(selectedZoho.id, editedZoho);
      const updatedContact = response.data;

      const index = zohoContacts.findIndex((c) => c.id === selectedZoho.id);
      if (index !== -1) {
        const newContacts = [...zohoContacts];
        newContacts[index] = updatedContact;
        setZohoContacts(newContacts);
        setSelectedZoho(updatedContact);
        setEditedZoho({});
      }
    } catch (err) {
      setError(
        `Error saving changes: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    }
  };
  const createNewContact = async () => {
    try {
      const response = await api.createZohoContact(newContact);
      const createdContact = response.data;
      setZohoContacts((prev) => [...prev, createdContact]);
      setSelectedZoho(createdContact);
      setNewContact({});
      setShowNewContact(false);
    } catch (err) {
      setError(
        `Error creating contact: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    }
  };

  const getDisplayValue = (
    contact: ZohoContact | null,
    field: Exclude<keyof ZohoContact, "id">, // Exclude "id" from the keys
    isCC: boolean,
    edited: Partial<ZohoContact>
  ): string => {
    if (!isCC && edited[field] !== undefined) {
      return edited[field] as string;
    }
    return getFieldValue(contact, field, isCC);
  };

  const renderFieldValue = (field: keyof ZohoContact, value: string | null) => {
    if (
      field === "linkedin_profile" &&
      value &&
      value.toLowerCase() !== "null"
    ) {
      return (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 underline break-all"
        >
          {value}
        </a>
      );
    }

    return value && value.toLowerCase() !== "null" ? (
      value
    ) : (
      <span className="text-gray-400 italic">Empty</span>
    );
  };

  const filteredZohoContacts = zohoContacts.filter((contact) => {
    const query = zohoSearch.toLowerCase();

    return (
      contact.first_name?.toLowerCase().includes(query) ||
      contact.last_name?.toLowerCase().includes(query) ||
      contact.email?.toLowerCase().includes(query)
    );
  });

  const filteredCCContacts = ccContacts.filter((contact) => {
    const query = ccSearch.toLowerCase();
    return (
      contact.first_name?.toLowerCase().includes(query) ||
      contact.last_name?.toLowerCase().includes(query) ||
      contact.email_address?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen w-full flex flex-col gap-6 p-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold text-gray-800 ">
          Contact Comparison Tool
        </h1>
        <p className="text-gray-600">
          Compare and manage Zoho CRM and Constant Contact contacts
        </p>
      </header>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-start">
          <ErrorIcon className="text-red-500" fontSize="inherit" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {/* Contact Selectors with Search */}
      <div className="grid grid-cols-2 gap-6 ">
        {/* ZOHO CONTACT SELECTOR */}
        <div className="flex flex-col gap-2 bg-white rounded-md border border-gray-200 p-2">
          <label className="uppercase tracking-tight font-bold text-gray-700 ">
            Search Zoho Contacts
          </label>
          <input
            type="text"
            value={zohoSearch}
            onChange={(e) => setZohoSearch(e.target.value)}
            placeholder="Search by first, last name, or email..."
            className="w-full border border-gray-300 rounded-md p-2 text-sm"
          />
          <select
            className="w-full border border-gray-300 rounded-md p-2 text-sm"
            value={selectedZoho?.id || ""}
            onChange={(e) => {
              const contact = filteredZohoContacts.find(
                (c) => c.id === e.target.value
              );
              if (contact) {
                setSelectedZoho(contact);
                setEditedZoho({});
              }
            }}
          >
            {filteredZohoContacts.map((contact) => (
              <option key={contact.id} value={contact.id}>
                {contact.first_name} {contact.last_name} - {contact.email}
              </option>
            ))}
            {filteredZohoContacts.length === 0 && (
              <option value="">No results found</option>
            )}
          </select>
        </div>

        {/* CONSTANT CONTACT SELECTOR */}
        <div className="flex flex-col gap-2 bg-white rounded-md border border-gray-200 p-2">
          <label className="uppercase tracking-tight font-bold text-gray-700">
            Search Constant Contact
          </label>
          <input
            type="text"
            value={ccSearch}
            onChange={(e) => setCcSearch(e.target.value)}
            placeholder="Search by first, last name, or email..."
            className="w-full border border-gray-300 rounded-md p-2 text-sm"
          />
          <select
            className="w-full border border-gray-300 rounded-md p-2 text-sm"
            value={selectedCC?.id ?? ""}
            onChange={(e) => {
              const contact = filteredCCContacts.find(
                (c) => c.id === Number(e.target.value)
              );
              if (contact) setSelectedCC(contact);
            }}
          >
            {filteredCCContacts.map((contact) => (
              <option key={contact.id} value={contact.id}>
                {contact.first_name} {contact.last_name} -{" "}
                {contact.email_address}
              </option>
            ))}
            {filteredCCContacts.length === 0 && (
              <option value="">No results found</option>
            )}
          </select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex gap-4">
          <button
            onClick={saveZohoChanges}
            disabled={Object.keys(editedZoho).length === 0}
            className="flex items-center gap-2 bg-blue-600 text-white text-sm uppercase tracking-tight font-medium p-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer"
          >
            <SaveIcon fontSize="inherit" />
            Save Zoho Changes
          </button>
          <button
            onClick={() => setShowNewContact(true)}
            className="flex text-sm uppercase tracking-tight font-medium p-2 items-center gap-2 bg-green-600 text-white p-2 rounded-md hover:bg-green-700 cursor-pointer"
          >
            <AddIcon fontSize="inherit" />
            Create New Contact
          </button>
        </div>
        <MatchTypeLegend />
      </div>

      {/* Comparison Grid */}
      <div className="bg-white rounded-md overflow-hidden">
        <div className="grid grid-cols-3 bg-gray-100 border-b border-gray-300">
          <div className="p-4 font-semibold text-gray-700">Field</div>
          <div className="p-4 font-semibold border-l border-gray-300">
            Zoho CRM (Editable)
          </div>
          <div className="p-4 font-semibold border-l border-gray-300">
            Constant Contact
          </div>
        </div>

        {(Object.keys(fieldMapping) as Array<keyof ZohoContact>).map(
          (field, idx) => {
            const zohoVal = getDisplayValue(
              selectedZoho,
              field as keyof typeof fieldMapping,
              false,
              editedZoho
            );
            const ccVal = getFieldValue(
              selectedCC,
              field as keyof typeof selectedCC,
              true
            );
            const matchType = getMatchType(zohoVal, ccVal);

            return (
              <div
                key={field}
                className={`grid grid-cols-3 border-b border-gray-200 ${
                  idx % 2 === 0 ? "bg-gray-50" : "bg-white"
                }`}
              >
                <div className="p-4 font-medium text-gray-700">
                  {fieldMapping[field as keyof typeof fieldMapping]?.label ||
                    "Unknown Field"}
                </div>
                <div
                  className={`p-4 border-l border-gray-200 relative ${getBackgroundColor(
                    matchType
                  )}`}
                >
                  <input
                    type="text"
                    value={zohoVal}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleZohoEdit(field, e.target.value)
                    }
                    className={`w-full border rounded px-2 py-1 ${
                      editedZoho[field] !== undefined
                        ? "border-blue-500 ring-2 ring-blue-200"
                        : "border-gray-300"
                    } ${getBackgroundColor(matchType)}`}
                    placeholder={
                      field === "linkedin_profile"
                        ? "https://linkedin.com/in/..."
                        : ""
                    }
                  />
                  {matchType !== "different" && (
                    <CheckIcon
                      className={`absolute right-6 top-1/2 -translate-y-1/2 ${getIconColor(
                        matchType
                      )}`}
                      fontSize="inherit"
                    />
                  )}
                </div>
                <div
                  className={`p-4 border-l border-gray-200 relative ${getBackgroundColor(
                    matchType
                  )}`}
                >
                  <div
                    className={`px-2 py-1 rounded ${getHighlightColor(
                      matchType
                    )}`}
                  >
                    {renderFieldValue(field, ccVal)}
                  </div>
                  {matchType !== "different" && (
                    <CheckIcon
                      className={`absolute right-6 top-1/2 -translate-y-1/2 ${getIconColor(
                        matchType
                      )}`}
                      fontSize="inherit"
                    />
                  )}
                </div>
              </div>
            );
          }
        )}
      </div>

      {/* New Contact Modal */}
      {showNewContact && (
        <div className="fixed inset-0 backdrop-blur-md bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <h2
              className="text-2xl font-bold text-gray-800
            "
            >
              Create New Zoho Contact
            </h2>
            <div className="space-y-4">
              {(Object.keys(fieldMapping) as Array<keyof ZohoContact>).map(
                (field) => (
                  <div key={field}>
                    <label className="block text-sm font-medium text-gray-700 ">
                      {fieldMapping[field as keyof typeof fieldMapping]
                        ?.label || "Unknown Field"}
                    </label>
                    <input
                      type="text"
                      value={newContact[field] || ""}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setNewContact((prev) => ({
                          ...prev,
                          [field]: e.target.value,
                        }))
                      }
                      className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                      placeholder={
                        field === "linkedin_profile"
                          ? "https://linkedin.com/in/..."
                          : ""
                      }
                    />
                  </div>
                )
              )}
            </div>
            <div className="flex gap-4 mt-6">
              <button
                onClick={createNewContact}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                Create Contact
              </button>
              <button
                onClick={() => {
                  setShowNewContact(false);
                  setNewContact({});
                }}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactComparison;
