// File: src/components/members/MemberForm.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import Button from "../ui/Button";
import useToast from "../../hooks/useToast";
import { Plus } from "lucide-react";

const emptyChild = () => ({
  fullName: "",
  age: "",
  gender: "",
  phone: "",
  type: "NONE", // NONE | STUDENT | EMPLOYED
  studentSchool: "",
  student_level: "",
  employedInstitution: "",
  employedProfession: "",
});

const emptyWife = () => ({
  fullName: "",
  age: "",
  occupation: "",
  contactNumber: "",
});

const MemberForm = ({ memberToEdit }) => {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const isEditMode = !!memberToEdit;
  const [isLoading, setIsLoading] = useState(false);

  const [hierarchy, setHierarchy] = useState({
    regions: [],
    districts: [],
    branches: [],
  });
  const [filtered, setFiltered] = useState({ districts: [], branches: [] });
  const [pictureFile, setPictureFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [pictureRemoved, setPictureRemoved] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    otherNames: "",
    surname: "",
    dateOfBirth: "", // UI: dd/mm/yyyy
    gender: "",
    maritalStatus: "",
    nationalIdType: "GHANA_CARD",
    nationalIdNumber: "",
    residentialAddress: "",
    contactNumber: "",
    regionId: "",
    districtId: "",
    branchId: "",
    joinYear: new Date().getFullYear(),
    employmentStatus: "UNEMPLOYED", // STUDENT | EMPLOYED | UNEMPLOYED | RETIRED
    employedInstitution: "",
    employedProfession: "",
    studentSchool: "", // member-level student school
    hasChildren: false,
    numberOfChildren: "",
    children: [],
    childrenInGMM: false,
    parentMemberId: "",
    status: "ACTIVE",
    pictureUrl: "",
    monthlyInfaqPledge: "",
    numberOfWives: "",
    wives: [],
    husband: { fullName: "", age: "", occupation: "", contactNumber: "" },
  });

  // ---------- helpers for date ----------
  const isoToDDMMYYYY = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };
  const ddmmyyyyToISO = (str) => {
    if (!str) return "";
    const parts = str.split("/");
    if (parts.length !== 3) return "";
    const [dd, mm, yyyy] = parts;
    return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
  };

  // ---------- Fetch hierarchy first, then preload edit data ----------
  useEffect(() => {
    const fetchHierarchy = async () => {
      try {
        setIsLoading(true);
        const [rRes, dRes, bRes] = await Promise.all([
          api.get("/regions"),
          api.get("/districts"),
          api.get("/branches"),
        ]);
        setHierarchy({
          regions: rRes.data || [],
          districts: dRes.data || [],
          branches: bRes.data || [],
        });
      } catch (err) {
        console.error("Failed to load hierarchy", err);
        addToast("Failed to load regions/districts/branches", "error");
      } finally {
        setIsLoading(false);
      }
    };
    fetchHierarchy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // preload filtered lists and form when editing (wait for hierarchy)
  useEffect(() => {
    if (!isEditMode) return;
    if (hierarchy.regions.length === 0) return;

    // set filtered lists based on memberToEdit region/district
    const filteredDistricts = hierarchy.districts.filter(
      (d) => d.regionId === memberToEdit.regionId
    );
    const filteredBranches = hierarchy.branches.filter(
      (b) =>
        b.regionId === memberToEdit.regionId &&
        (!memberToEdit.districtId || b.districtId === memberToEdit.districtId)
    );
    setFiltered({ districts: filteredDistricts, branches: filteredBranches });

    // normalize children/wives/husband
    const normalizedChildren = (memberToEdit.children || []).map((c) => ({
      fullName: c.fullName || "",
      age: c.age || "",
      gender: c.gender || "",
      phone: c.phone || "",
      type: c.type || "NONE",
      studentSchool: c.studentSchool || c.studentSchool || "",
      student_level: c.student_level || c.studentLevel || "",
      employedInstitution: c.employedInstitution || c.employedInstitution || "",
      employedProfession: c.employedProfession || c.employedProfession || "",
    }));

    const normalizedWives = (memberToEdit.wives || []).map((w) => ({
      fullName: w.fullName || "",
      age: w.age || "",
      occupation: w.occupation || "",
      contactNumber: w.contactNumber || "",
    }));

    const normalizedHusband =
      Array.isArray(memberToEdit.husband) && memberToEdit.husband.length > 0
        ? memberToEdit.husband[0]
        : memberToEdit.husband || {
            fullName: "",
            age: "",
            occupation: "",
            contactNumber: "",
          };

    setFormData((p) => ({
      ...p,
      ...memberToEdit,
      dateOfBirth: memberToEdit.dateOfBirth
        ? isoToDDMMYYYY(memberToEdit.dateOfBirth)
        : "",
      employmentStatus: memberToEdit.employmentStatus || "UNEMPLOYED",
      employedInstitution: memberToEdit.employedInstitution || "",
      employedProfession: memberToEdit.employedProfession || "",
      studentSchool: memberToEdit.studentSchool || "",
      nationalIdType: memberToEdit.nationalIdType || p.nationalIdType,
      nationalIdNumber: memberToEdit.nationalIdNumber || p.nationalIdNumber,
      numberOfWives:
        normalizedWives.length > 0
          ? normalizedWives.length
          : memberToEdit.numberOfWives || "",
      wives: normalizedWives,
      children: normalizedChildren,
      numberOfChildren:
        normalizedChildren.length > 0
          ? normalizedChildren.length
          : memberToEdit.numberOfChildren || "",
      husband: normalizedHusband,
      pictureUrl: memberToEdit.pictureUrl || "",
      regionId: memberToEdit.regionId || "",
      districtId: memberToEdit.districtId || "",
      branchId: memberToEdit.branchId || "",
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode, memberToEdit, hierarchy]);

  // ---------- Cascading selects ----------
  useEffect(() => {
    if (hierarchy.regions.length === 0) return; // wait for all data

    let newFilteredDistricts = [];
    let branchesInScope = [];

    // 1. FILTER DISTRICTS based on selected REGION
    if (formData.regionId) {
      newFilteredDistricts = hierarchy.districts.filter(
        (d) => d.regionId === formData.regionId
      );
    }

    // 2. FILTER BRANCHES based on selected REGION/DISTRICT
    if (formData.districtId) {
      branchesInScope = hierarchy.branches.filter(
        (b) => b.districtId === formData.districtId
      );
    } else if (formData.regionId) {
      // Branches associated directly with a region (no district)
      branchesInScope = hierarchy.branches.filter(
        (b) => b.regionId === formData.regionId && !b.districtId
      );
    }

    // Set the filtered lists
    setFiltered((p) => ({
      districts: newFilteredDistricts,
      branches: branchesInScope,
    }));

    // 3. LOGIC TO CLEAR INVALID BRANCH ID (Preserves the one for edit mode pre-load)
    if (formData.branchId) {
      const branchStillValid = branchesInScope.some(
        (b) => b.id === formData.branchId
      );

      // Only clear if the current branchId is no longer in the filtered list
      if (!branchStillValid) {
        setFormData((p) => ({ ...p, branchId: "" }));
      }
    }

    // 4. LOGIC TO CLEAR INVALID DISTRICT ID (Necessary if Region is changed)
    if (formData.districtId) {
      const districtStillValid = newFilteredDistricts.some(
        (d) => d.id === formData.districtId
      );
      // If a region is selected, but the previously selected district is not in the new region's list, clear it.
      if (!districtStillValid) {
        setFormData((p) => ({ ...p, districtId: "" }));
      }
    }
  }, [
    formData.districtId,
    formData.regionId,
    formData.branchId, // Added for the branch validation check
    hierarchy.branches,
    hierarchy.districts, // Added to watch for district changes
  ]); // Add formData.branchId to dependencies

  // useEffect(() => {
  //   let branchesInScope = [];
  //   if (formData.districtId) {
  //     branchesInScope = hierarchy.branches.filter(
  //       (b) => b.districtId === formData.districtId
  //     );
  //   } else if (formData.regionId) {
  //     branchesInScope = hierarchy.branches.filter(
  //       (b) => b.regionId === formData.regionId && !b.districtId
  //     );
  //   }
  //   setFiltered((p) => ({ ...p, branches: branchesInScope }));

  //   if (
  //     !isEditMode ||
  //     (memberToEdit &&
  //       (formData.districtId !== memberToEdit.districtId ||
  //         formData.regionId !== memberToEdit.regionId))
  //   ) {
  //     setFormData((p) => ({ ...p, branchId: "" }));
  //   }
  // }, [
  //   formData.districtId,
  //   formData.regionId,
  //   hierarchy.branches,
  //   isEditMode,
  //   memberToEdit,
  // ]);

  // ---------- handlers ----------
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((p) => ({
      ...p,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPictureFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setPictureRemoved(false);
    setFormData((p) => ({ ...p, pictureUrl: "" }));
  };

  // nested update
  const handleNestedChange = (type, idx, field, value) => {
    setFormData((p) => {
      const arr = [...p[type]];
      arr[idx] = { ...arr[idx], [field]: value };
      return { ...p, [type]: arr };
    });
  };

  const handleChildTypeChange = (idx, newType) => {
    setFormData((p) => {
      const arr = [...p.children];
      const child = { ...arr[idx] };
      child.type = newType;
      if (newType === "STUDENT") {
        child.employedInstitution = "";
        child.employedProfession = "";
      } else if (newType === "EMPLOYED") {
        child.studentSchool = "";
        child.student_level = "";
      } else {
        child.studentSchool = "";
        child.student_level = "";
        child.employedInstitution = "";
        child.employedProfession = "";
      }
      arr[idx] = child;
      return { ...p, children: arr };
    });
  };

  // add / remove children
  const addChild = () => {
    setFormData((p) => ({
      ...p,
      children: [...p.children, emptyChild()],
      numberOfChildren: (Number(p.numberOfChildren || 0) + 1).toString(),
    }));
  };
  const removeChild = (idx) => {
    setFormData((p) => {
      const arr = [...p.children];
      arr.splice(idx, 1);
      return {
        ...p,
        children: arr,
        numberOfChildren: Math.max(
          0,
          Number(p.numberOfChildren || 0) - 1
        ).toString(),
      };
    });
  };

  // add / remove wives
  const addWife = () => {
    setFormData((p) => ({
      ...p,
      wives: [...p.wives, emptyWife()],
      numberOfWives: (Number(p.numberOfWives || 0) + 1).toString(),
    }));
  };
  const removeWife = (idx) => {
    setFormData((p) => {
      const arr = [...p.wives];
      arr.splice(idx, 1);
      return {
        ...p,
        wives: arr,
        numberOfWives: Math.max(0, Number(p.numberOfWives || 0) - 1).toString(),
      };
    });
  };

  // ---------- submit ----------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const submission = new FormData();

      // convert DOB to ISO for backend
      const isoDob = ddmmyyyyToISO(formData.dateOfBirth);

      if (
        formData.nationalIdNumber === "" ||
        formData.nationalIdNumber === null
      ) {
        formData.nationalIdType = null;
      }

      // append all fields except husband (will add conditionally)
      Object.entries(formData).forEach(([k, v]) => {
        if (k === "husband") return;
        if (k === "dateOfBirth") {
          submission.append("dateOfBirth", isoDob || "");
        } else if (Array.isArray(v)) {
          submission.append(k, JSON.stringify(v));
        } else if (typeof v === "boolean") {
          submission.append(k, v ? 1 : 0);
        } else {
          submission.append(k, v ?? "");
        }
      });

      // husband if female & married
      if (
        formData.gender === "FEMALE" &&
        formData.maritalStatus === "MARRIED"
      ) {
        submission.append("husband", JSON.stringify(formData.husband));
      } else {
        submission.append("husband", "");
      }

      if (pictureFile) submission.append("picture", pictureFile);

      if (isEditMode) {
        await api.put(`/members/${memberToEdit.id}`, submission, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        addToast("Member updated", "success");
      } else {
        await api.post("/members", submission, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        addToast("Member created", "success");
      }
      navigate("/members");
    } catch (err) {
      console.error("Save member error", err);
      addToast(
        err?.response?.data?.message || "Failed to save member",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // render child block
  const renderChild = (child, idx) => (
    <div key={idx} className="p-4 border rounded-md bg-gray-50 shadow-sm">
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-medium">Child {idx + 1}</h4>
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => removeChild(idx)}
            className="text-sm text-red-600 hover:underline"
          >
            Remove
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <input
          className="input"
          value={child.fullName}
          onChange={(e) =>
            handleNestedChange("children", idx, "fullName", e.target.value)
          }
          placeholder="Full name"
        />
        <input
          className="input"
          type="number"
          value={child.age}
          onChange={(e) =>
            handleNestedChange("children", idx, "age", e.target.value)
          }
          placeholder="Age"
        />
        <select
          className="input"
          value={child.gender || ""}
          onChange={(e) =>
            handleNestedChange("children", idx, "gender", e.target.value)
          }
        >
          <option value="">Gender</option>
          <option value="MALE">Male</option>
          <option value="FEMALE">Female</option>
        </select>

        <input
          className="input"
          value={child.phone || ""}
          onChange={(e) =>
            handleNestedChange("children", idx, "phone", e.target.value)
          }
          placeholder="Phone (optional)"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <label className="text-sm text-gray-600 content-center">Status</label>
          <select
            className="input"
            value={child.type || "NONE"}
            onChange={(e) => handleChildTypeChange(idx, e.target.value)}
          >
            <option value="NONE">None</option>
            <option value="STUDENT">Student</option>
            <option value="EMPLOYED">Employed</option>
          </select>
        </div>

        {/* conditional */}
        {child.type === "STUDENT" && (
          <>
            <input
              className="input md:col-span-2"
              value={child.studentSchool || ""}
              onChange={(e) =>
                handleNestedChange(
                  "children",
                  idx,
                  "studentSchool",
                  e.target.value
                )
              }
              placeholder="School name"
            />
            {/* <input
              className="input"
              value={child.student_level || ""}
              onChange={(e) =>
                handleNestedChange(
                  "children",
                  idx,
                  "student_level",
                  e.target.value
                )
              }
              placeholder="Level (Primary/SHS/etc)"
            /> */}
          </>
        )}

        {child.type === "EMPLOYED" && (
          <>
            <input
              className="input md:col-span-2"
              value={child.employedInstitution || ""}
              onChange={(e) =>
                handleNestedChange(
                  "children",
                  idx,
                  "employedInstitution",
                  e.target.value
                )
              }
              placeholder="Institution / Employer"
            />
            <input
              className="input"
              value={child.employedProfession || ""}
              onChange={(e) =>
                handleNestedChange(
                  "children",
                  idx,
                  "employedProfession",
                  e.target.value
                )
              }
              placeholder="Profession / Job title"
            />
          </>
        )}
      </div>
    </div>
  );

  // ---------- JSX ----------
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Status + picture */}
      <div className="p-4 border rounded-md">
        <h3 className="text-lg font-semibold mb-4">Member Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="input"
            >
              <option value="ACTIVE">Active</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="DECEASED">Deceased</option>
            </select>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">
                Profile Picture
              </label>
              {formData.pictureUrl && !pictureRemoved && !previewUrl ? (
                <div className="mt-2 flex items-center space-x-4">
                  <img
                    src={
                      formData.pictureUrl.startsWith("http")
                        ? formData.pictureUrl
                        : `https://api.ghanamuslimmission.net${formData.pictureUrl}`
                    }
                    alt="Member"
                    className="h-20 w-20 rounded-full object-cover border shadow-sm"
                  />
                  <div>
                    <div className="text-xs text-gray-500">Current Picture</div>
                    <button
                      type="button"
                      className="text-xs text-red-600 hover:underline mt-1"
                      onClick={() => {
                        if (window.confirm("Remove?")) {
                          setPictureRemoved(true);
                          setPictureFile(null);
                          setPreviewUrl("");
                          setFormData((p) => ({ ...p, pictureUrl: "" }));
                        }
                      }}
                    >
                      Remove Picture
                    </button>
                  </div>
                </div>
              ) : previewUrl ? (
                <div className="mt-2 flex items-center space-x-4">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="h-20 w-20 rounded-full object-cover border shadow-sm"
                  />
                  <div>
                    <div className="text-xs text-gray-500">
                      New Picture Preview
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewUrl("");
                        setPictureFile(null);
                      }}
                      className="text-xs text-red-600 hover:underline mt-1"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <p className="mt-2 text-xs text-gray-500 italic">
                  No profile picture uploaded.
                </p>
              )}

              <div className="mt-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-700"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Upload JPG, PNG, or GIF (max 2MB).
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Personal Details */}
      <div className="p-4 border rounded-md">
        <h3 className="text-lg font-semibold mb-4">Personal Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            placeholder="First Name *"
            className="input"
            required
          />
          <input
            name="otherNames"
            value={formData.otherNames}
            onChange={handleChange}
            placeholder="Other Names"
            className="input"
          />
          <input
            name="surname"
            value={formData.surname}
            onChange={handleChange}
            placeholder="Surname *"
            className="input"
            required
          />

          <input
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleChange}
            placeholder="Date of Birth (dd/mm/yyyy) *"
            className="input text-gray-500"
            required
            pattern="\d{2}\/\d{2}\/\d{4}"
            title="dd/mm/yyyy"
          />

          <input
            name="contactNumber"
            value={formData.contactNumber}
            onChange={handleChange}
            placeholder="Contact Number *"
            className="input"
            required
          />

          <input
            name="residentialAddress"
            value={formData.residentialAddress}
            onChange={handleChange}
            placeholder="Residential Address *"
            className="input md:col-span-3"
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <label className="text-sm text-gray-600 content-center">
              National ID Type
            </label>
            <select
              name="nationalIdType"
              value={formData.nationalIdType}
              onChange={handleChange}
              className="input"
            >
              <option value="GHANA_CARD">Ghana Card</option>
              <option value="NHIS">NHIS</option>
            </select>
          </div>

          <input
            name="nationalIdNumber"
            value={formData.nationalIdNumber}
            onChange={handleChange}
            placeholder="ID Number (if any)"
            className="input"
          />

          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="input"
            required
          >
            <option value="">Select Gender</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
          </select>

          <select
            name="maritalStatus"
            value={formData.maritalStatus}
            onChange={handleChange}
            className="input"
            required
          >
            <option value="">Select Marital Status</option>
            <option value="SINGLE">Single</option>
            <option value="MARRIED">Married</option>
            <option value="DIVORCED">Divorced</option>
            <option value="WIDOWED">Widowed</option>
          </select>

          {/* wives / husband */}
          {formData.gender === "MALE" &&
            formData.maritalStatus === "MARRIED" && (
              <>
                <div className="mt-4 md:col-span-4">
                  <div className="flex items-center">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Wife(s)
                      </label>
                      <div className="text-xs text-gray-500">
                        Add wife details below.
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={addWife}
                    className="mt-2 flex items-center gap-2 px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-md shadow-sm transition"
                  >
                    <Plus className="w-4 h-4" />
                    Add Wife
                  </button>
                  <div className="space-y-4 mt-4">
                    {formData.wives.map((w, i) => (
                      <div
                        key={i}
                        className="p-4 border rounded-md bg-gray-50 shadow-sm"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium">Wife {i + 1}</h4>
                          <button
                            type="button"
                            onClick={() => removeWife(i)}
                            className="text-sm text-red-600 hover:underline"
                          >
                            Remove
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                          <input
                            value={w.fullName}
                            onChange={(e) =>
                              handleNestedChange(
                                "wives",
                                i,
                                "fullName",
                                e.target.value
                              )
                            }
                            placeholder="Full Name"
                            className="input"
                          />
                          <input
                            type="number"
                            value={w.age}
                            onChange={(e) =>
                              handleNestedChange(
                                "wives",
                                i,
                                "age",
                                e.target.value
                              )
                            }
                            placeholder="Age"
                            className="input"
                          />
                          <input
                            value={w.occupation}
                            onChange={(e) =>
                              handleNestedChange(
                                "wives",
                                i,
                                "occupation",
                                e.target.value
                              )
                            }
                            placeholder="Occupation"
                            className="input"
                          />
                          <input
                            value={w.contactNumber}
                            onChange={(e) =>
                              handleNestedChange(
                                "wives",
                                i,
                                "contactNumber",
                                e.target.value
                              )
                            }
                            placeholder="Contact Number"
                            className="input"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

          {formData.gender === "FEMALE" &&
            formData.maritalStatus === "MARRIED" && (
              <div className="mt-6 md:col-span-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Husband
                  </label>
                  <div className="text-xs text-gray-500">
                    Fill details of your husband below.
                  </div>
                </div>
                <div className="p-4 border rounded-md bg-gray-50 shadow-sm mt-4">
                  <h4 className="font-medium text-gray-700 mb-3">Husband</h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <input
                      value={formData.husband.fullName || ""}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          husband: { ...p.husband, fullName: e.target.value },
                        }))
                      }
                      placeholder="Full Name"
                      className="input"
                    />
                    <input
                      type="number"
                      value={formData.husband.age || ""}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          husband: { ...p.husband, age: e.target.value },
                        }))
                      }
                      placeholder="Age"
                      className="input"
                    />
                    <input
                      value={formData.husband.occupation || ""}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          husband: { ...p.husband, occupation: e.target.value },
                        }))
                      }
                      placeholder="Occupation"
                      className="input"
                    />
                    <input
                      value={formData.husband.contactNumber || ""}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          husband: {
                            ...p.husband,
                            contactNumber: e.target.value,
                          },
                        }))
                      }
                      placeholder="Contact Number"
                      className="input"
                    />
                  </div>
                </div>
              </div>
            )}
        </div>
      </div>

      {/* Organizational */}
      <div className="p-4 border rounded-md">
        <h3 className="text-lg font-semibold mb-4">Organizational Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select
            name="regionId"
            value={formData.regionId}
            onChange={handleChange}
            className="input"
            required
          >
            <option value="">Select Region *</option>
            {hierarchy.regions.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>

          <select
            name="districtId"
            value={formData.districtId}
            onChange={handleChange}
            className="input"
            disabled={!formData.regionId}
          >
            <option value="">Select District (if applicable)</option>
            {filtered.districts.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          <select
            name="branchId"
            value={formData.branchId}
            onChange={handleChange}
            className="input"
            disabled={!formData.regionId}
            required
          >
            <option value="">Select Branch *</option>
            {filtered.branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>

          <input
            name="joinYear"
            type="number"
            value={formData.joinYear}
            onChange={handleChange}
            placeholder="Year of Joining *"
            className="input"
            required
          />
          {/* <input
            name="parentMemberId"
            value={formData.parentMemberId}
            onChange={handleChange}
            placeholder="Parent's Member ID (if any)"
            className="input md:col-span-2"
          /> */}
          <div className="py-4">
            <h3 className="text-lg font-semibold mb-4">Monthly Infaq Pledge</h3>
            <input
              type="number"
              name="monthlyInfaqPledge"
              value={formData.monthlyInfaqPledge}
              onChange={handleChange}
              placeholder="Monthly Infaq Pledge (Amount)"
              className="input w-full"
              min="0"
            />
          </div>
        </div>

        {/* <div className="py-4">
          <h3 className="text-lg font-semibold mb-4">Monthly Infaq Pledge</h3>
          <input
            type="number"
            name="monthlyInfaqPledge"
            value={formData.monthlyInfaqPledge}
            onChange={handleChange}
            placeholder="Monthly Infaq Pledge (Amount)"
            className="input w-1/4"
            min="0"
          />
        </div> */}
      </div>

      {/* Other details - employment & children */}
      <div className="p-4 border rounded-md">
        <h3 className="text-lg font-semibold mb-4">Other Details</h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          <label className="text-sm text-gray-600">Employment Status</label>
          <select
            name="employmentStatus"
            value={formData.employmentStatus}
            onChange={handleChange}
            className="input"
          >
            <option value="STUDENT">Student</option>
            <option value="EMPLOYED">Employed</option>
            <option value="UNEMPLOYED">Unemployed</option>
            <option value="RETIRED">Retired</option>
          </select>

          {/* show member-level studentSchool when STUDENT */}
          {formData.employmentStatus === "STUDENT" && (
            <input
              name="studentSchool"
              value={formData.studentSchool}
              onChange={handleChange}
              placeholder="School name (member)"
              className="input"
            />
          )}

          {formData.employmentStatus === "EMPLOYED" && (
            <>
              <input
                name="employedInstitution"
                value={formData.employedInstitution}
                onChange={handleChange}
                placeholder="Institution / Employer"
                className="input md:col-span-1"
              />
              <input
                name="employedProfession"
                value={formData.employedProfession}
                onChange={handleChange}
                placeholder="Profession / Job title"
                className="input md:col-span-1"
              />
            </>
          )}
        </div>

        {/* children */}
        <div className="mt-6">
          <div className="flex items-center">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Children
              </label>
              <div className="text-xs text-gray-500">
                Add children details below.
              </div>
            </div>
          </div>
          <div className="mt-2">
            <button
              type="button"
              onClick={addChild}
              className="flex items-center gap-2 px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-md shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              Add Child
            </button>
          </div>

          {formData.children.length > 0 ? (
            <div className="space-y-4 mt-4">
              {formData.children.map((c, i) => renderChild(c, i))}
            </div>
          ) : (
            <p className="text-xs text-gray-500 mt-3">No children added.</p>
          )}
        </div>
      </div>

      {/* actions */}
      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="secondary"
          onClick={() =>
            navigate(isEditMode ? `/members/${memberToEdit.id}` : "/members")
          }
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Member"}
        </Button>
      </div>
    </form>
  );
};

export default MemberForm;
