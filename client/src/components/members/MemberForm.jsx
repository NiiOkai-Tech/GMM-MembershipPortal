// File: src/components/members/MemberForm.jsx
// A comprehensive form for creating/editing a member.
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import Button from "../ui/Button";
import useToast from "../../hooks/useToast";

const MemberForm = ({ memberToEdit }) => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [formData, setFormData] = useState({
    firstName: "",
    otherNames: "",
    surname: "",
    dateOfBirth: "",
    gender: "",
    maritalStatus: "",
    nationalIdNumber: "",
    residentialAddress: "",
    contactNumber: "",
    regionId: "",
    districtId: "",
    branchId: "",
    joinYear: new Date().getFullYear(),
    occupation: "",
    isEmployed: false,
    hasChildren: false,
    numberOfChildren: 0,
    childrenInGMM: false,
    parentMemberId: "",
  });
  const [hierarchy, setHierarchy] = useState({
    regions: [],
    districts: [],
    branches: [],
  });
  const [filtered, setFiltered] = useState({ districts: [], branches: [] });
  const [isLoading, setIsLoading] = useState(false);
  const isEditMode = !!memberToEdit;

  useEffect(() => {
    const fetchHierarchy = async () => {
      setIsLoading(true);
      try {
        const [regionsRes, districtsRes, branchesRes] = await Promise.all([
          api.get("/regions"),
          api.get("/districts"),
          api.get("/branches"),
        ]);
        setHierarchy({
          regions: regionsRes.data,
          districts: districtsRes.data,
          branches: branchesRes.data,
        });
      } catch (err) {
        addToast("Failed to load required data.", "error");
      } finally {
        setIsLoading(false);
      }
    };
    fetchHierarchy();
  }, [addToast]);

  useEffect(() => {
    if (isEditMode) {
      const { dateOfBirth, ...rest } = memberToEdit;
      setFormData({
        ...rest,
        dateOfBirth: dateOfBirth
          ? new Date(dateOfBirth).toISOString().split("T")[0]
          : "",
      });
    }
  }, [memberToEdit, isEditMode]);
  useEffect(() => {
    if (formData.regionId) {
      setFiltered((p) => ({
        ...p,
        districts: hierarchy.districts.filter(
          (d) => d.regionId === formData.regionId
        ),
      }));
    } else {
      setFiltered((p) => ({ ...p, districts: [] }));
    }
    if (
      !isEditMode ||
      (memberToEdit && formData.regionId !== memberToEdit.regionId)
    ) {
      setFormData((p) => ({ ...p, districtId: "", branchId: "" }));
    }
  }, [formData.regionId, hierarchy.districts, isEditMode, memberToEdit]);
  useEffect(() => {
    let branchesInScope = [];
    if (formData.districtId) {
      branchesInScope = hierarchy.branches.filter(
        (b) => b.districtId === formData.districtId
      );
    } else if (formData.regionId) {
      branchesInScope = hierarchy.branches.filter(
        (b) => b.regionId === formData.regionId && !b.districtId
      );
    }
    setFiltered((p) => ({ ...p, branches: branchesInScope }));
    if (
      !isEditMode ||
      (memberToEdit &&
        (formData.districtId !== memberToEdit.districtId ||
          formData.regionId !== memberToEdit.regionId))
    ) {
      setFormData((p) => ({ ...p, branchId: "" }));
    }
  }, [
    formData.districtId,
    formData.regionId,
    hierarchy.branches,
    isEditMode,
    memberToEdit,
  ]);

  useEffect(() => {
    if (!formData.isEmployed) {
      setFormData((p) => ({ ...p, occupation: "" }));
    }
  }, [formData.isEmployed]);

  useEffect(() => {
    if (!formData.hasChildren) {
      setFormData((p) => ({ ...p, childrenInGMM: false }));
    }
  }, [formData.hasChildren]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((p) => ({
      ...p,
      [name]: type === "checkbox" ? checked : value,
    }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const apiCall = isEditMode
      ? api.put(`/members/${memberToEdit.id}`, formData)
      : api.post("/members", formData);
    try {
      await apiCall;
      addToast(
        `Member ${isEditMode ? "updated" : "added"} successfully!`,
        "success"
      );
      navigate("/members");
    } catch (err) {
      addToast(
        err.response?.data?.message ||
          `Failed to ${isEditMode ? "update" : "add"} member.`,
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 border rounded-md">
        <h3 className="text-lg font-semibold mb-4">Personal Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            name="contactNumber"
            value={formData.contactNumber}
            onChange={handleChange}
            placeholder="Contact Number *"
            className="input"
            required
          />
          <input
            name="dateOfBirth"
            type="date"
            value={formData.dateOfBirth}
            onChange={handleChange}
            className="input text-gray-500"
            required
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
          <input
            name="nationalIdNumber"
            value={formData.nationalIdNumber}
            onChange={handleChange}
            placeholder="National ID Number"
            className="input"
          />
          <input
            name="residentialAddress"
            value={formData.residentialAddress}
            onChange={handleChange}
            placeholder="Residential Address"
            className="input md:col-span-3"
          />
        </div>
      </div>
      <div className="p-4 border rounded-md">
        <h3 className="text-lg font-semibold mb-4">Organizational Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          <input
            name="parentMemberId"
            value={formData.parentMemberId}
            onChange={handleChange}
            placeholder="Parent's Member ID (if any)"
            className="input md:col-span-2"
          />
        </div>
      </div>
      <div className="p-4 border rounded-md">
        <h3 className="text-lg font-semibold mb-4">Other Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          <div className="flex items-center space-x-4">
            <span>Employed?</span>
            <label>
              <input
                type="radio"
                name="isEmployed"
                checked={formData.isEmployed}
                onChange={() =>
                  setFormData((p) => ({ ...p, isEmployed: true }))
                }
              />{" "}
              Yes
            </label>
            <label>
              <input
                type="radio"
                name="isEmployed"
                checked={!formData.isEmployed}
                onChange={() =>
                  setFormData((p) => ({ ...p, isEmployed: false }))
                }
              />{" "}
              No
            </label>
          </div>
          {formData.isEmployed && (
            <input
              name="occupation"
              value={formData.occupation}
              onChange={handleChange}
              placeholder="Occupation"
              className="input"
            />
          )}
          <div className="flex items-center space-x-4">
            <span>Has Children?</span>
            <label>
              <input
                type="radio"
                name="hasChildren"
                checked={formData.hasChildren}
                onChange={() =>
                  setFormData((p) => ({ ...p, hasChildren: true }))
                }
              />{" "}
              Yes
            </label>
            <label>
              <input
                type="radio"
                name="hasChildren"
                checked={!formData.hasChildren}
                onChange={() =>
                  setFormData((p) => ({ ...p, hasChildren: false }))
                }
              />{" "}
              No
            </label>
          </div>
          {formData.hasChildren && (
            <div className="flex items-center space-x-4">
              <span>Children in GMM?</span>
              <label>
                <input
                  type="radio"
                  name="childrenInGMM"
                  checked={formData.childrenInGMM}
                  onChange={() =>
                    setFormData((p) => ({ ...p, childrenInGMM: true }))
                  }
                />{" "}
                Yes
              </label>
              <label>
                <input
                  type="radio"
                  name="childrenInGMM"
                  checked={!formData.childrenInGMM}
                  onChange={() =>
                    setFormData((p) => ({ ...p, childrenInGMM: false }))
                  }
                />{" "}
                No
              </label>
            </div>
          )}
        </div>
      </div>
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
