import React, { useState } from "react";
import "../styles/tj.css";

const initialState = {
  role: "",
  work_mode: "",
  location: "",
  number_of_vacancy: "",
  year_of_experience: "",
  salary: "",
  company_name: "",
  industry_mode: "",
  education: "",
  required_skill_set: "",
  company_description: "",
  job_description: "",
  apply_now_url: "",
};

const Todayjobsform = () => {
  const [formData, setFormData] = useState(initialState);
  const [jobs, setJobs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  /* INPUT CHANGE */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /* CREATE / UPDATE JOB */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const url = editingId
      ? `https://jobs.mpdatahub.com/api/jobs-update/${editingId}`
      : "https://jobs.mpdatahub.com/api/job/create";

    try {
      const res = await fetch(url, {
        method: editingId ? "POST" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.status) {
        alert(editingId ? "Job updated ✅" : "Job posted ✅");
        setFormData(initialState);
        setEditingId(null);
        fetchJobs();
      } else {
        alert("Operation failed ❌");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong!");
    }
  };

  /* LIST JOBS */
  const fetchJobs = async () => {
    try {
      const res = await fetch("https://jobs.mpdatahub.com/api/job/list");
      const data = await res.json();
      if (data.status) {
        setJobs(data.data || []);
        setShowModal(true);
      }
    } catch (err) {
      console.error(err);
    }
  };


  /* EDIT JOB */
  const handleEdit = (job) => {
    setFormData(job);
    setEditingId(job.id);
    setShowModal(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this job?")) return;

    try {
      const res = await fetch(
        `https://jobs.mpdatahub.com/api/jobs-delete/${id}`,
        { method: "POST" }
      );
      const data = await res.json();
      if (data.status) {
        fetchJobs();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="postjob-container">
      <h2 className="postjob-title">
        {editingId ? "Edit Job" : "Today Jobs Form"}
      </h2>

      <button type="button" className="btn-list" onClick={fetchJobs}>
        List Jobs
      </button>

      <form className="postjob-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label>Role</label>
            <input
              type="text"
              name="role"
              value={formData.role}
              onChange={handleChange}
              placeholder="Enter the role"
              required
            />
          </div>

          <div className="form-group">
            <label>Work Mode</label>
            <select
              name="work_mode"
              value={formData.work_mode}
              onChange={handleChange}
              required
            >
              <option value="">Select an Option</option>
              <option value="Remote">Remote</option>
              <option value="Hybrid">Hybrid</option>
              <option value="Onsite">Onsite</option>
            </select>
          </div>

          <div className="form-group">
            <label>Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Enter Your Location"
              required
            />
          </div>
        </div>

        {/* Row 2 */}
        <div className="form-row">
          <div className="form-group">
            <label>Number Of Vacancy</label>
            <input
              type="number"
              name="number_of_vacancy"
              value={formData.number_of_vacancy}
              onChange={handleChange}
              placeholder="0"
              required
            />
          </div>

          <div className="form-group">
            <label>Year Of Experience</label>
            <input
              type="text"
              name="year_of_experience"
              value={formData.year_of_experience}
              onChange={handleChange}
              placeholder="2-4"
              required
            />
          </div>

          <div className="form-group">
            <label>Salary</label>
            <input
              type="text"
              name="salary"
              value={formData.salary}
              onChange={handleChange}
              placeholder="6 - 8 LPA"
              required
            />
          </div>
        </div>

        {/* Row 3 */}
        <div className="form-row">
          <div className="form-group">
            <label>Company Name</label>
            <input
              type="text"
              name="company_name"
              value={formData.company_name}
              onChange={handleChange}
              placeholder="Enter Your Company"
              required
            />
          </div>

          <div className="form-group">
            <label>Industry Mode</label>
            <select
              name="industry_mode"
              value={formData.industry_mode}
              onChange={handleChange}
              required
            >
              <option value="">Select an Option</option>
              <option value="IT Services">IT Services</option>
              <option value="Finance">Finance</option>
              <option value="Healthcare">Healthcare</option>
            </select>
          </div>
        </div>

        {/* Full width fields */}
        <div className="form-group full-width">
          <label>Education</label>
          <input
            type="text"
            name="education"
            value={formData.education}
            onChange={handleChange}
            placeholder="B.E / B.Tech"
            required
          />
        </div>

        <div className="form-group full-width">
          <label>Required Skill Set</label>
          <input
            type="text"
            name="required_skill_set"
            value={formData.required_skill_set}
            onChange={handleChange}
            placeholder="React, Node, API"
            required
          />
        </div>

        <div className="form-group full-width">
          <label>Company Description</label>
          <textarea
            name="company_description"
            value={formData.company_description}
            onChange={handleChange}
            placeholder="Enter Here..."
            required
          />
        </div>

        <div className="form-group full-width">
          <label>Job Description</label>
          <textarea
            name="job_description"
            value={formData.job_description}
            onChange={handleChange}
            placeholder="Enter Here..."
            required
          />
        </div>

        <div className="form-group full-width">
          <label>Apply Now URL</label>
          <input
            type="url"
            name="apply_now_url"
            value={formData.apply_now_url}
            onChange={handleChange}
            placeholder="https://company.com/careers/apply"
            required
          />
        </div>


        {/* Buttons */}
        {/* <div className="form-actions">
          <button type="reset" className="btn-clear">
            Clear All
          </button>
          <button type="submit" className="btn-submit">
            Post Job
          </button>
        </div> */}

        {/* Buttons */}
        <div className="form-actions">
          <button
            type="button"
            className="btn-clear"
            onClick={() => {
              setFormData(initialState);
              setEditingId(null);
            }}
          >
            Clear
          </button>

          <button type="submit" className="btn-submit">
            {editingId ? "Update Job" : "Post Job"}
          </button>
        </div>
      </form>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Posted Jobs</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                ✖
              </button>
            </div>

            {jobs.length === 0 && <p>No jobs found.</p>}

            <div className="modal-body">
              {jobs.map((job) => (
                <div className="job-card" key={job.id}>
                  <h4>{job.role}</h4>
                  <p><b>{job.company_name}</b> – {job.location}</p>

                  <div className="job-actions">
                    <button
                      className="btn-edit"
                      onClick={() => handleEdit(job)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(job.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Todayjobsform;
