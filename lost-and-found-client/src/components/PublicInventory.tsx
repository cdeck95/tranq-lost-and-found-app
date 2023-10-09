import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL, Disc } from '../App';
import '../styles/Inventory.css'; // Import the CSS file
import { DateTime } from 'luxon';
import { CircularProgress, Divider, IconButton, InputBase, Paper, TextField, useMediaQuery } from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import EditDialog from './EditDialog';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import SearchIcon from '@mui/icons-material/Search';
import { useTheme } from "@mui/material";
import Tooltip from '@mui/material/Tooltip';
import InfoIcon from '@mui/icons-material/Info';
import BackToTopButton from './BackToTopButton';


// Define a type for row IDs, assuming it's a number
type RowId = number;

function PublicInventory() {
    const [inventory, setInventory] = useState<Disc[]>([]); // Provide the type 'Disc[]'
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredInventory, setFilteredInventory] = useState(inventory); // Initialize with inventory data
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [claimedDisc, setClaimedDisc] = useState<number>(0); // Provide the type 'Disc | null'
    const theme = useTheme();
    const isMobile = !useMediaQuery(theme.breakpoints.up("md"));
    const isMediumLarge = useMediaQuery(theme.breakpoints.down("lg"));
    const isLarge = useMediaQuery(theme.breakpoints.down("xl"));
    
    const initialTooltipState: { [key: number]: boolean } = {};
    filteredInventory.forEach((disc: Disc) => {
      initialTooltipState[disc.id!] = false;
    });

    const [tooltipState, setTooltipState] = useState(initialTooltipState);

    const toggleTooltip = (discId: number) => {
      setTooltipState((prevState) => ({
        ...prevState,
        [discId]: !prevState[discId],
      }));
    };

  const [expandedRows, setExpandedRows] = useState<RowId[]>([]);

  const toggleRow = (rowId: RowId) => {
    if (expandedRows.includes(rowId)) {
      setExpandedRows(expandedRows.filter((id) => id !== rowId));
    } else {
      setExpandedRows([...expandedRows, rowId]);
    }
  };

  const convertToEST = (utcTimestamp: string) => {
    const dateUTC = DateTime.fromISO(utcTimestamp, { zone: 'utc' });
    // const dateEST = dateUTC.setZone('America/New_York');
    
    // Format the date to display only the date (without time)
    //return dateEST.toFormat('yyyy-MM-dd');
    return dateUTC.toFormat('yyyy-MM-dd');
  };

  function maskPhoneNumber(phoneNumber: string): string {
    const last4Digits = phoneNumber.slice(-4);
    const maskedNumber = '****-****-' + last4Digits;
    return maskedNumber;
  }

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/inventory`)
      .then((response) => {
        // Convert UTC timestamps to EST
        const convertedInventory = response.data.map((disc: Disc) => ({
          ...disc,
          dateFound: convertToEST(disc.dateFound),
          dateTexted: disc.dateTexted ? convertToEST(disc.dateTexted) : null,
          dateClaimed: disc.dateClaimed ? convertToEST(disc.dateClaimed) : null,
          pickupDeadline: disc.pickupDeadline ? convertToEST(disc.pickupDeadline) : null,
        }));
        console.log('Inventory:', convertedInventory);
  
        setInventory(convertedInventory);
  
        // Filter the inventory based on the search query
        const filtered = convertedInventory.filter((disc: Disc) => {
            const phoneNumberLast4Digits = disc.phoneNumber.slice(-4); // Get the last 4 digits of the phone number
            return (
              phoneNumberLast4Digits.includes(searchQuery) ||
              disc.disc.includes(searchQuery) ||
              disc.name.includes(searchQuery) ||
              disc.comments?.includes(searchQuery)
            );
          });
        setFilteredInventory(filtered);
      })
      .catch((error) => {
        console.error('Error fetching inventory:', error);
      });
  }, [searchQuery]);

  return (
    <div className="page-container"> 
      <div className="col-center">
        {/* <h1>Inventory</h1> */}
        {/* <div className="search-bar"> */}
          <Paper component="form" sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', marginTop: "5px", width: isMobile? "300px" : "700px"  }}>
            <InputBase
              sx={{ ml: 1, flex: 1 }}
              placeholder="Search by phone number (last 4 digits), disc, or name"
              onChange={(e) => {
                const inputQuery = e.target.value;
            
                // Check if the input matches a phone number pattern (e.g., XXXX-XXXX-1234)
                const isPhoneNumber = /^\d{4}-\d{4}-\d{4}$/.test(inputQuery);
            
                // If it's a phone number, use the last 4 digits; otherwise, use the entire query
                const filteredQuery = isPhoneNumber ? inputQuery.slice(-4) : inputQuery;
            
                setSearchQuery(filteredQuery);
              }}
              value={searchQuery}
              type="text"
            />
            <IconButton type="button" sx={{ p: '10px' }} aria-label="search">
              <SearchIcon />
            </IconButton>
          </Paper>
        {/* </div> */}
    </div>
    <div className="container">
      <table className="inventory-table"> 
        <thead>
          <tr>
            <th className="table-header"> </th>
            {/* <th className="table-header">ID</th>  */}
            <th className="table-header">Name</th> 
            <th className="table-header">Phone Number</th> 
            <th className="table-header">Disc</th> 
            {/* <th className="table-header">Color</th> 
            <th className="table-header">Bin</th> 
            <th className="table-header">Date Found</th> 
            <th className="table-header">Comments</th>  */}
            {/* <th className="table-header">Actions</th>  */}
          </tr>
        </thead>
        <tbody>
          {filteredInventory.map((disc) => (
            <React.Fragment key={disc.id}>
              <tr onClick={() => toggleRow(disc.id!)}>
                <td className="table-cell">{expandedRows.includes(disc.id!) ? '▼' : '▶'}</td>
                {/* <td className="table-cell">{disc.id}</td> */}
                <td className="table-cell">{disc.name}</td>
                <td className="table-cell">{maskPhoneNumber(disc.phoneNumber)}</td>
                <td className="table-cell">{disc.disc}</td>
                {/* <td className="table-cell">
                  <Tooltip
                      title="Instructions on how to pick up the disc"
                      open={tooltipState[disc.id!]}
                      onClose={() => toggleTooltip(disc.id!)}
                      disableFocusListener={!tooltipState[disc.id!]}
                      disableHoverListener={!tooltipState[disc.id!]}
                    >
                      <IconButton
                        aria-label="help"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent row click event
                          toggleTooltip(disc.id!); // Toggle the tooltip for this disc
                        }}
                        onMouseEnter={() => toggleTooltip(disc.id!)}
                        onMouseLeave={() => toggleTooltip(disc.id!)}
                      >
                      <InfoIcon />
                    </IconButton>
                  </Tooltip>
                </td> */}
                {/* <td className="table-cell"></td> */}
              </tr>
              {/* Additional details row */}
              {expandedRows.includes(disc.id!) && (
                <tr>
                  <td colSpan={8}> {/* Use appropriate colspan */}
                    <div>
                      <p><strong>ID:</strong> {disc.id}</p>
                      <p><strong>Course: </strong>{disc.course}</p>
                      <p><strong>Name: </strong>{disc.name}</p>
                      <p><strong>Phone Number: </strong>{maskPhoneNumber(disc.phoneNumber)}</p>
                      <p><strong>Disc: </strong>{disc.disc}</p>
                      <p><strong>Color: </strong>{disc.color}</p>
                      <p><strong>Bin: </strong>{disc.bin}</p>
                      <p><strong>Date Found: </strong>{disc.dateFound}</p>
                      <p><strong>Date Texted: </strong>{disc.dateTexted}</p>
                      <p><strong>Date Claimed: </strong>{disc.dateClaimed}</p>
                      <p><strong>Status: </strong>{disc.status}</p>
                      <p><strong>Pickup Deadline: </strong>{disc.pickupDeadline}</p>
                      <p><strong>Comments: </strong>{disc.comments}</p>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
        {/* <tbody>
            {filteredInventory.map((disc: Disc) => (
            <tr key={disc.id}>
              {editedDiscID===disc.id
              ? <td className="table-cell"><SaveOutlinedIcon sx={{ cursor: "pointer"}} onClick={stopEditing}></SaveOutlinedIcon></td>
              : <td className="table-cell"><EditOutlinedIcon sx={{ cursor: "pointer"}} onClick={() => startEditing(disc)}></EditOutlinedIcon></td>
              }
              <td className="table-cell">{disc.id}</td>
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
                  disc.name
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
                    value={disc.color}
                    style={{ width: '90%' }}
                    onChange={(e) => {
                      disc.color = e.target.value;
                      setEditedDisc({ ...disc, color: e.target.value });
                    }}
                  />
                ) : (
                  disc.color // Display text when not editing
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
        </tbody> */}
      </table>
      <BackToTopButton />
    </div>
    </div>
  );
}

export default PublicInventory;
