const express = require('express');
const { createCrudRouter } = require('./crudRouterFactory');

const Client = require('../models/Client');
const ClientCompany = require('../models/ClientCompany');
const Agent = require('../models/Agent');
const JobDemand = require('../models/JobDemand');
const Candidate = require('../models/Candidate');
const Case = require('../models/Case');

const router = express.Router();

router.use('/clients', createCrudRouter(Client, {
  codePrefix: 'CLI', searchFields: ['code', 'name', 'email', 'phone'],
  moduleName: 'Client', moduleKey: 'clients'
}));

router.use('/client-companies', createCrudRouter(ClientCompany, {
  codePrefix: 'CO', searchFields: ['code', 'name', 'uen'],
  populate: ['client'], moduleName: 'ClientCompany', moduleKey: 'clientCompanies'
}));

router.use('/agents', createCrudRouter(Agent, {
  codePrefix: 'AGT', searchFields: ['code', 'name', 'email'],
  moduleName: 'Agent', moduleKey: 'agents'
}));

router.use('/job-demands', createCrudRouter(JobDemand, {
  codePrefix: 'JD', searchFields: ['code', 'position'],
  populate: ['client', 'company', 'assignedRecruiter'], moduleName: 'JobDemand', moduleKey: 'jobDemands'
}));

router.use('/candidates', createCrudRouter(Candidate, {
  codePrefix: 'CAN', searchFields: ['code', 'fullName', 'passportNumber'],
  populate: ['agent'], moduleName: 'Candidate', moduleKey: 'candidates'
}));

router.use('/cases', createCrudRouter(Case, {
  codePrefix: 'CS', searchFields: ['code', 'title'],
  populate: ['assignedTo', 'client', 'company', 'worker'], moduleName: 'Case', moduleKey: 'cases'
}));

module.exports = router;
