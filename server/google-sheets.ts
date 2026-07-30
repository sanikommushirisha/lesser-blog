// Google Sheets integration (Replit connector: google-sheet)
import { google } from 'googleapis';
import type { Signup, BusinessSignup } from '@shared/schema';

let connectionSettings: any;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }

  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY
    ? 'repl ' + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
    ? 'depl ' + process.env.WEB_REPL_RENEWAL
    : null;

  if (!xReplitToken) {
    throw new Error('X-Replit-Token not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=google-sheet',
    {
      headers: {
        'Accept': 'application/json',
        'X-Replit-Token': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('Google Sheet not connected');
  }
  return accessToken;
}

async function getUncachableGoogleSheetClient() {
  const accessToken = await getAccessToken();
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: accessToken });
  return google.sheets({ version: 'v4', auth: oauth2Client });
}

async function getDriveClient() {
  const accessToken = await getAccessToken();
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: accessToken });
  return google.drive({ version: 'v3', auth: oauth2Client });
}

const SHEET_TITLE = 'Lesser Website Signups - Leads';
const HEADERS = [
  'Timestamp',
  'First Name',
  'Last Name',
  'Email',
  'Phone',
  'Employment Type',
  'Equity Types',
  'Income Range',
  'Has CPA',
  'Source Page',
];

let spreadsheetId: string | null = null;

async function ensureLeadsSheet(sheetId: string): Promise<void> {
  const sheets = await getUncachableGoogleSheetClient();
  const meta = await sheets.spreadsheets.get({ spreadsheetId: sheetId, fields: 'sheets.properties.title' });
  const sheetNames = meta.data.sheets?.map(s => s.properties?.title) || [];

  if (!sheetNames.includes('Individual leads')) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: sheetId,
      requestBody: {
        requests: [{ addSheet: { properties: { title: 'Individual leads' } } }],
      },
    });
  }
  await sheets.spreadsheets.values.update({
    spreadsheetId: sheetId,
    range: "'Individual leads'!A1:J1",
    valueInputOption: 'RAW',
    requestBody: { values: [HEADERS] },
  });
}

async function findOrCreateSpreadsheet(): Promise<string> {
  if (spreadsheetId) return spreadsheetId;

  const drive = await getDriveClient();

  const search = await drive.files.list({
    q: `name='${SHEET_TITLE}' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`,
    fields: 'files(id,name)',
    spaces: 'drive',
  });

  if (search.data.files && search.data.files.length > 0) {
    spreadsheetId = search.data.files[0].id!;
    await ensureLeadsSheet(spreadsheetId);
    return spreadsheetId;
  }

  const sheets = await getUncachableGoogleSheetClient();
  const created = await sheets.spreadsheets.create({
    requestBody: {
      properties: { title: SHEET_TITLE },
      sheets: [{ properties: { title: 'Individual leads' } }],
    },
  });

  spreadsheetId = created.data.spreadsheetId!;

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: "'Individual leads'!A1:J1",
    valueInputOption: 'RAW',
    requestBody: { values: [HEADERS] },
  });

  return spreadsheetId;
}

export async function appendSignupToSheet(signup: Signup): Promise<void> {
  const sheetId = await findOrCreateSpreadsheet();
  const sheets = await getUncachableGoogleSheetClient();

  const row = [
    signup.createdAt ? new Date(signup.createdAt).toISOString() : new Date().toISOString(),
    signup.firstName,
    signup.lastName,
    signup.email,
    signup.phone,
    signup.employmentType,
    signup.equityTypes ? signup.equityTypes.join(', ') : '',
    signup.incomeRange,
    signup.hasCpa === true ? 'Yes' : signup.hasCpa === false ? 'No' : '',
    signup.sourcePage || '',
  ];

  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range: "'Individual leads'!A:J",
    valueInputOption: 'RAW',
    requestBody: { values: [row] },
  });

  console.log(`[Google Sheets] Lead appended: ${signup.email}`);
}

const BUSINESS_HEADERS = [
  'Timestamp',
  'First Name',
  'Last Name',
  'Email',
  'Phone',
  'Business Name',
  'Business Type',
  'Form Type',
  'Annual Revenue',
  'State of Incorporation',
  'Has Filed Before',
  'Source Page',
];

async function ensureBusinessLeadsSheet(sheetId: string): Promise<void> {
  const sheets = await getUncachableGoogleSheetClient();
  const meta = await sheets.spreadsheets.get({ spreadsheetId: sheetId, fields: 'sheets.properties.title' });
  const sheetNames = meta.data.sheets?.map(s => s.properties?.title) || [];

  if (!sheetNames.includes('Business leads')) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: sheetId,
      requestBody: {
        requests: [{ addSheet: { properties: { title: 'Business leads' } } }],
      },
    });
  }
  await sheets.spreadsheets.values.update({
    spreadsheetId: sheetId,
    range: "'Business leads'!A1:L1",
    valueInputOption: 'RAW',
    requestBody: { values: [BUSINESS_HEADERS] },
  });
}

export async function appendBusinessSignupToSheet(signup: BusinessSignup): Promise<void> {
  const sheetId = await findOrCreateSpreadsheet();
  await ensureBusinessLeadsSheet(sheetId);
  const sheets = await getUncachableGoogleSheetClient();

  const row = [
    signup.createdAt ? new Date(signup.createdAt).toISOString() : new Date().toISOString(),
    signup.firstName,
    signup.lastName,
    signup.email,
    signup.phone,
    signup.businessName,
    signup.businessType,
    signup.formType,
    signup.annualRevenue,
    signup.stateOfIncorporation || '',
    signup.hasFiledBefore === true ? 'Yes' : signup.hasFiledBefore === false ? 'No' : '',
    signup.sourcePage || '',
  ];

  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range: "'Business leads'!A:L",
    valueInputOption: 'RAW',
    requestBody: { values: [row] },
  });

  console.log(`[Google Sheets] Business lead appended: ${signup.email}`);
}
