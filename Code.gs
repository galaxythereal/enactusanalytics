var SHEET_NAME = "Form Responses";
var SHEET_ID = "1ZqSHX8YYunjyqPCPW_MGaSvpODA0ZYL2JXPMOrWlirM";

function doGet(e) {
  console.log('doGet function called');
  return getApplicants();
}

function getApplicants() {
  console.log('getApplicants function called');
  var lock = LockService.getPublicLock();
  lock.waitLock(30000);  // Wait 30 seconds before conceding defeat.
  
  try {
    console.log('Attempting to open spreadsheet');
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    console.log('Spreadsheet opened successfully');
    
    const data = sheet.getDataRange().getValues();
    console.log('Data retrieved, number of rows:', data.length);
    
    const headers = data[0];
    console.log('Headers:', headers);
    
    const applicants = [];
    
    for (let i = 1; i < data.length; i++) {
      const applicant = {};
      for (let j = 0; j < headers.length; j++) {
        applicant[headers[j]] = data[i][j];
      }
      applicants.push(applicant);
    }
    
    console.log('Number of applicants processed:', applicants.length);
    
    // Calculate statistics
    const stats = calculateStats(applicants);
    
    const response = {
      status: "success",
      data: applicants,
      stats: stats
    };
    
    console.log('Response prepared, returning data');
    
    return ContentService.createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (e) {
    console.error('Error in getApplicants:', e);
    const errorResponse = {
      status: "error",
      message: e.toString()
    };
    return ContentService.createTextOutput(JSON.stringify(errorResponse))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function calculateStats(applicants) {
  let stats = {
    totalApplicants: applicants.length,
    genderDistribution: {},
    committeeDistribution: {},
    facultyDistribution: {},
    yearDistribution: {}
  };
  
  applicants.forEach(applicant => {
    const gender = applicant['gender'] || 'Unknown';
    const committee = applicant['preferredCommittee'] || 'Unknown';
    const faculty = applicant['faculty'] || 'Unknown';
    const year = applicant['academicYear'] || 'Unknown';
    
    stats.genderDistribution[gender] = (stats.genderDistribution[gender] || 0) + 1;
    stats.committeeDistribution[committee] = (stats.committeeDistribution[committee] || 0) + 1;
    stats.facultyDistribution[faculty] = (stats.facultyDistribution[faculty] || 0) + 1;
    stats.yearDistribution[year] = (stats.yearDistribution[year] || 0) + 1;
  });
  
  return stats;
}
