import {DataSourceTemplate, log } from "@graphprotocol/graph-ts"
import { newFunder } from '../generated/SecurityToken/SecurityToken'
import { NewProject } from '../generated/TokenFactory/TokenFactory'
import { FundingToken, Project } from '../generated/schema'

export function handleNewFunding(event: newFunder): void {
  let fundingToken = new FundingToken(event.params.funder.toHex())
  log.info("New funder at address: {}", [event.params.funder.toHex()])
  fundingToken.id = event.params.tokenId.toHex()
  fundingToken.owner = event.params.funder.toHex()
  fundingToken.fundingvalue = event.params.value
  fundingToken.tenor = event.params.tenor
  fundingToken.save()
}

export function handleNewProject(event: NewProject): void {
  let newProject = new Project(event.params.baseURI)
  log.info("New project at address: {}", [event.params.project.toHex()])
  newProject.id = event.params.baseURI
  newProject.name = event.params.name
  newProject.projectAddress = event.params.project.toHex()
  newProject.ownerAddress = event.params.owner.toHex()
  newProject.bidderAddress = event.params.bidder.toHex()
  newProject.auditorAddress = event.params.auditor.toHex()
  newProject.save()
}