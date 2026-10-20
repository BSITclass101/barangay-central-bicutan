import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";

const Residents = () => {

  const [residents, setResidents] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(false);
  const [search, setSearch] = useState("");

  const [formData, setFormData] = useState({
    id: "",
    first_name: "",
    middle_name: "",
    last_name: "",
    gender: "",
    age: "",
    address: "",
    contact_number: "",
    civil_status: "",
    citizenship: "",
  });


  useEffect(() => {

    fetch("http://localhost/barangay-api/api/getResidents.php")
      .then((res) => res.json())
      .then((data) => {

        const formattedData = data.map((resident) => ({
  id: resident.id,

  first_name: resident.first_name,
  middle_name: resident.middle_name,
  last_name: resident.last_name,

  gender: resident.gender,
  age: resident.age,
  address: resident.address,

  contact_number: resident.contact_number,
  civil_status: resident.civil_status,
  citizenship: resident.citizenship,
  status: resident.status,
}));

        setResidents(formattedData);

      })
      .catch((err)=>console.error(err));

  }, []);



  const handleChange = (e)=>{

  const {name, value} = e.target;


  const textFields = [
    "first_name",
    "middle_name",
    "last_name",
    "address",
    "citizenship"
  ];


  const specialCharacters =
  /[!@#$%^&*()_+=\[\]{};:'"\\|,.<>/?`~]/;


  if(textFields.includes(name)){


    if(specialCharacters.test(value)){


      alert("Special characters are not allowed!");

      return;

    }


    const capitalizedValue = value
      .toLowerCase()
      .replace(/\b\w/g,(char)=>char.toUpperCase());


    setFormData({

      ...formData,

      [name]: capitalizedValue

    });


    return;

  }


  if(name === "contact_number"){


    if(/^[0-9]*$/.test(value)){


      setFormData({

        ...formData,

        [name]: value

      });


    }


    return;

  }


  setFormData({

    ...formData,

    [name]: value

  });


};



  const handleAdd = ()=>{

    setEditing(false);

    setFormData({
      id:"",
      first_name: "",
      middle_name: "",
      last_name: "",
      gender:"",
      age:"",
      address:"",
      contact_number:"",
      civil_status:"",
      citizenship:"",
    });

    setShowModal(true);

  };



  const handleEdit = (resident)=>{

    setEditing(true);
    setFormData(resident);
    setShowModal(true);

  };



  const handleDelete = (id)=>{

    if(window.confirm("Delete this resident?")){

      fetch(
        "http://localhost/barangay-api/api/deleteResident.php",
        {
          method:"POST",
          headers:{
            "Content-Type":"application/json"
          },
          body:JSON.stringify({
            id:id
          })
        }
      )
      .then(res=>res.json())
      .then(()=>{

        setResidents(
          residents.filter(
            (r)=>r.id !== id
          )
        );

      });

    }

  };

  const handleApprove = (id) => {

  fetch("http://localhost/barangay-api/api/approveResident.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id }),
  })
    .then((res) => res.json())
    .then((data) => {

      if (data.success) {

        setResidents((prev) =>
          prev.map((resident) =>
            resident.id === id
              ? { ...resident, status: "Active" }
              : resident
          )
        );

        alert("Resident Approved!");

      } else {
        alert(data.message);
      }

    })
    .catch((err) => console.error(err));

};


 const handleSubmit = (e) => {
  e.preventDefault();

  const url = editing
    ? "http://localhost/barangay-api/api/updateResident.php"
    : "http://localhost/barangay-api/api/addResident.php";

  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  })
    .then((res) => res.json())
    .then(() => {
      return fetch("http://localhost/barangay-api/api/getResidents.php");
    })
    .then((res) => res.json())
    .then((data) => {
      const formattedData = data.map((resident) => ({
        id: resident.id,
        first_name: resident.first_name,
        middle_name: resident.middle_name,
        last_name: resident.last_name,
        gender: resident.gender,
        age: resident.age,
        address: resident.address,
        contact_number: resident.contact_number,
        civil_status: resident.civil_status,
        citizenship: resident.citizenship,
        status: resident.status,
      }));

      setResidents(formattedData);
      setShowModal(false);
      setEditing(false);
    })
    .catch((err) => console.error(err));
};



  

  return (

<div className="p-6">


<div className="flex justify-between mb-5">

<h1 className="text-3xl font-bold">
Residents
</h1>


<button
onClick={handleAdd}
className="bg-blue-600 text-white px-5 py-2 rounded-lg flex items-center gap-2"
>
<FaPlus/>
Add Resident
</button>


</div>


<div className="mb-5">
  <input
    type="text"
    placeholder="Search Resident..."
    value={search}
    onChange={(e) => {
      const value = e.target.value;
      setSearch(value);

      fetch(`http://localhost/barangay-api/api/searchResidents.php?search=${value}`)
        .then((res) => res.json())
        .then((data) => {
          const formattedData = data.map((resident) => ({
            id: resident.id,
            first_name: resident.first_name,
            middle_name: resident.middle_name,
            last_name: resident.last_name,
            gender: resident.gender,
            age: resident.age,
            address: resident.address,
            contact_number: resident.contact_number,
            civil_status: resident.civil_status,
            citizenship: resident.citizenship,
            status: resident.status,
          }));

          setResidents(formattedData);
        })
        .catch((err) => console.error(err));
    }}
    className="border p-3 rounded-lg w-80"
  />
</div>



<div className="bg-white rounded-xl shadow overflow-hidden">


<table className="w-full">


<thead className="bg-gray-100">

<tr>

<th className="p-3">ID</th>
<th className="p-3">First Name</th>
<th className="p-3">Middle Name</th>
<th className="p-3">Last Name</th>
<th className="p-3">Gender</th>
<th className="p-3">Age</th>
<th className="p-3">Address</th>
<th className="p-3">Contact</th>
<th className="p-3">Civil Status</th>
<th className="p-3">Citizenship</th>
<th className="p-3">Status</th>
<th className="p-3">Action</th>

</tr>

</thead>


<tbody>

{
residents.map((resident)=>(

<tr key={resident.id} className="border-b">


<td className="p-3">
{resident.id}
</td>


<td className="p-3">
{resident.first_name}
</td>

<td className="p-3">
{resident.middle_name}
</td>

<td className="p-3">
{resident.last_name}
</td>


<td className="p-3">
{resident.gender}
</td>


<td className="p-3">
{resident.age}
</td>


<td className="p-3">
{resident.address}
</td>


<td className="p-3">
{resident.contact_number}
</td>


<td className="p-3">
{resident.civil_status}
</td>


<td className="p-3">
  {resident.citizenship}
</td>

<td className="p-3">

  {resident.status === "Pending" && (
    <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm">
      Pending
    </span>
  )}

  {resident.status === "Active" && (
    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
      Active
    </span>
  )}

  {resident.status === "Rejected" && (
    <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm">
      Rejected
    </span>
  )}

</td>

<td className="p-3">

  {resident.status === "Pending" && (
    <button
      onClick={() => handleApprove(resident.id)}
      className="bg-green-600 text-white px-3 py-2 rounded mr-2"
    >
      Approve
    </button>
  )}

  <button
    onClick={() => handleEdit(resident)}
    className="bg-yellow-500 text-white px-3 py-2 rounded mr-2"
  >
    <FaEdit />
  </button>

  <button
    onClick={() => handleDelete(resident.id)}
    className="bg-red-600 text-white px-3 py-2 rounded"
  >
    <FaTrash />
  </button>


</td>



</tr>

))
}


</tbody>


</table>


</div>
{showModal && (

  <div className="fixed inset-0 bg-black/50 flex justify-center items-center">


    <div className="bg-white p-6 rounded-xl w-[400px]">


      <h2 className="text-2xl font-bold mb-4">

        {editing ? "Edit Resident" : "Add Resident"}

      </h2>



      <form onSubmit={handleSubmit}>


        <input
  name="first_name"
  placeholder="First Name"
  value={formData.first_name}
  onChange={handleChange}
  className="border w-full p-2 rounded mb-3"
  required
/>

<input
  name="middle_name"
  placeholder="Middle Name"
  value={formData.middle_name}
  onChange={handleChange}
  className="border w-full p-2 rounded mb-3"
/>

<input
  name="last_name"
  placeholder="Last Name"
  value={formData.last_name}
  onChange={handleChange}
  className="border w-full p-2 rounded mb-3"
  required
/>


        <select
          name="gender"
          value={formData.gender}
          onChange={handleChange}
          className="border w-full p-2 rounded mb-3"
          required
        >

          <option value="">
            Select Gender
          </option>

          <option>
            Male
          </option>

          <option>
            Female
          </option>

        </select>




        <input
          name="age"
          type="number"
          placeholder="Age"
          value={formData.age}
          onChange={handleChange}
          className="border w-full p-2 rounded mb-3"
          required
        />




        <input
          name="address"
          placeholder="Address"
          value={formData.address}
          onChange={handleChange}
          className="border w-full p-2 rounded mb-3"
          required
        />




        <input
          name="contact_number"
          type=""
          placeholder="Contact Number"
          value={formData.contact_number}
          onChange={handleChange}
          className="border w-full p-2 rounded mb-3"
          required
        />




        <select
          name="civil_status"
          value={formData.civil_status}
          onChange={handleChange}
          className="border w-full p-2 rounded mb-3"
          required
        >

          <option value="">
            Select Civil Status
          </option>

          <option>
            Single
          </option>

          <option>
            Married
          </option>

          <option>
            Widowed
          </option>

          <option>
            Separated
          </option>

        </select>




        <input
          name="citizenship"
          placeholder="Citizenship"
          value={formData.citizenship}
          onChange={handleChange}
          className="border w-full p-2 rounded mb-4"
          required
        />




        <div className="flex justify-end gap-2">


          <button
            type="button"
            onClick={()=>setShowModal(false)}
            className="bg-gray-500 text-white px-4 py-2 rounded"
          >

            Cancel

          </button>




          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >

            Save

          </button>


        </div>



      </form>


    </div>


  </div>

)}


</div>

);

};


export default Residents;