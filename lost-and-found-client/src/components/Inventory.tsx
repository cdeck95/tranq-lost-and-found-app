import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL, Disc } from '../App';
import '../styles/Inventory.css'; // Import the CSS file
import { DateTime } from 'luxon';
import { CircularProgress } from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import EditDialog from './EditDialog';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';

function Inventory() {
    const [inventory, setInventory] = useState<Disc[]>([]); // Provide the type 'Disc[]'
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredInventory, setFilteredInventory] = useState(inventory); // Initialize with inventory data
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [claimedDisc, setClaimedDisc] = useState<number>(0); // Provide the type 'Disc | null'


  // Assuming your API server is running on localhost:3000

  const convertToEST = (utcTimestamp: string) => {
    const dateUTC = DateTime.fromISO(utcTimestamp, { zone: 'utc' });
    const dateEST = dateUTC.setZone('America/New_York');
    
    // Format the date to display only the date (without time)
    return dateEST.toFormat('yyyy-MM-dd');
  };

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/inventory`)
      .then((response) => {
        // Convert UTC timestamps to EST
        const convertedInventory = response.data.map((disc: Disc) => ({
          ...disc,
          dateFound: convertToEST(disc.dateFound),
          dateTexted: disc.dateTexted ? convertToEST(disc.dateTexted) : null,
          dateClaimed: disc.dateClaimed ? convertToEST(disc.dateClaimed) : null,
        }));
  
        setInventory(convertedInventory);
  
        // Filter the inventory based on the search query
        const filtered = convertedInventory.filter((disc: Disc) =>
          disc.phoneNumber.includes(searchQuery) ||
          disc.disc.includes(searchQuery) ||
          disc.name.includes(searchQuery) ||
          disc.comments?.includes(searchQuery)
        );
  
        setFilteredInventory(filtered);
      })
      .catch((error) => {
        console.error('Error fetching inventory:', error);
      });
  }, [searchQuery]);

  const markAsClaimed = (discId: string) => {
    setIsLoading(true); // Set loading state to true
  
    axios.put(`${API_BASE_URL}/api/mark-claimed/${discId}`)
      .then((response) => {
        console.log('Disc marked as claimed:', response.data);
        setIsLoading(false); // Set loading state to false
        setSuccessMessage('Disc claimed successfully'); // Set success message
        setClaimedDisc(parseInt(discId)); // Set claimedDisc to the ID of the disc being marked as claimed
      })
      .catch((error) => {
        console.error('Error marking disc as claimed:', error);
        setIsLoading(false); // Set loading state to false in case of an error
        setSuccessMessage('Error marking disc as claimed'); // Set error message
      });
  };

  const [editedDiscID, setEditedDiscID] = useState<number>(-1);
  const [editedDisc, setEditedDisc] = useState<Disc | null>(null);

  const startEditing = (disc: Disc) => {
    setEditedDisc(disc);
    setEditedDiscID(disc.id!);
  };

  const stopEditing = () => {
    saveEditedDisc(editedDisc!);
  };

  const saveEditedDisc = (editedDiscIn: Disc) => {
    if (editedDiscIn) {
      axios.put(`${API_BASE_URL}/api/edit-disc/${editedDiscIn.id}`, editedDiscIn)
        .then((response) => {
          console.log('Disc updated:', response.data);
          // Refresh the inventory or handle success as needed
        })
        .catch((error) => {
          console.error('Error updating disc:', error);
          // Handle error or display an error message
        });
    }
    setEditedDisc(null);
    setEditedDiscID(-1);
  };

  return (
    <div className="page-container"> 
      <h1>Inventory</h1>
      <div className="search-bar">
      <input
        type="text"
        placeholder="Search by phone number, disc, or name"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
    </div>
      <table className="inventory-table"> {/* Apply className */}
        <thead>
          <tr>
            <th className="table-header">Edit</th> {/* Add an "Edit" header */}
            <th className="table-header">ID</th> {/* Apply className */}
            <th className="table-header">Name</th> {/* Apply className */}
            <th className="table-header">Phone Number</th> {/* Apply className */}
            <th className="table-header">Disc</th> {/* Apply className */}
            <th className="table-header">Bin</th> {/* Apply className */}
            <th className="table-header">Date Found</th> {/* Apply className */}
            <th className="table-header">Comments</th> {/* Apply className */}
            <th className="table-header">Action</th> {/* Apply className */}
          </tr>
        </thead>
        <tbody>
            {filteredInventory.map((disc: Disc) => (
            <tr key={disc.id}>
              {editedDiscID===disc.id
              ? <td className="table-cell"><SaveOutlinedIcon sx={{ cursor: "pointer"}} onClick={stopEditing}></SaveOutlinedIcon></td>
              : <td className="table-cell"><EditOutlinedIcon sx={{ cursor: "pointer"}} onClick={() => startEditing(disc)}></EditOutlinedIcon></td>
              }
              <td className="table-cell">{disc.id}</td> {/* Apply className */}
              <td className="table-cell">
                {editedDiscID === disc.id ? (
                  <input
                    type="text"
                    value={disc.name}
                    style={{ width: '90%' }}
                    onChange={(e) => {
                      disc.name = e.target.value;
                      setEditedDisc({ ...disc, name: e.target.value });
                    }}
                  />
                ) : (
                  disc.name // Display text when not editing
                )}
              </td>
              <td className="table-cell">
                {editedDiscID === disc.id ? (
                  <input
                    type="number"
                    value={disc.phoneNumber}
                    style={{ width: '90%' }}
                    onChange={(e) => {
                      disc.phoneNumber = e.target.value;
                      setEditedDisc({ ...disc, phoneNumber: e.target.value });
                    }}
                  />
                ) : (
                  disc.phoneNumber // Display text when not editing
                )}
              </td>
              <td className="table-cell">
                {editedDiscID === disc.id ? (
                  <input
                    type="text"
                    value={disc.disc}
                    style={{ width: '90%' }}
                    onChange={(e) => {
                      disc.disc = e.target.value;
                      setEditedDisc({ ...disc, disc: e.target.value });
                    }}
                  />
                ) : (
                  disc.disc // Display text when not editing
                )}
              </td>
              <td className="table-cell">
                {editedDiscID === disc.id ? (
                  <input
                    type="text"
                    value={disc.bin}
                    style={{ width: '90%' }}
                    onChange={(e) => {
                      disc.bin = e.target.value;
                      setEditedDisc({ ...disc, bin: e.target.value });
                    }}
                  />
                ) : (
                  disc.bin // Display text when not editing
                )}
              </td>
              <td className="table-cell">
                {editedDiscID === disc.id ? (
                  <input
                    type="date"
                    value={disc.dateFound}
                    style={{ width: '90%' }}
                    onChange={(e) => {
                      disc.dateFound = e.target.value;
                      setEditedDisc({ ...disc, dateFound: e.target.value });
                    }}
                  />
                ) : (
                  disc.dateFound // Display text when not editing
                )}
              </td>
              <td className="table-cell">
                {editedDiscID === disc.id ? (
                  <input
                    type="text"
                    value={disc.comments!}
                    style={{ width: '90%' }}
                    onChange={(e) => {
                      disc.comments = e.target.value;
                      setEditedDisc({ ...disc, comments: e.target.value });
                    }}
                  />
                ) : (
                  disc.comments // Display text when not editing
                )}
              </td>
              <td className="table-cell">
                {isLoading ? (
                <div><CircularProgress/></div>
                ) : (
                    <div>
                        {disc.id!==claimedDisc && <button className="button" onClick={() => markAsClaimed(disc.id!.toString())}>Mark as Claimed</button>}
                    </div>
                    )}
                {successMessage && disc.id===claimedDisc && <div className="success-message">{successMessage}</div>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Inventory;
