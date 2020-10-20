import {DataSourceTemplate, log } from "@graphprotocol/graph-ts"
import { newFunder } from '../generated/SecurityToken/SecurityToken'
import { FundingToken } from '../generated/schema'

export function handleNewFunding(event: newFunder): void {
  let fundingToken = new FundingToken(event.params.funder.toHex())
  log.info("New funder at address: {}", [event.params.funder.toHex()])
  fundingToken.id = event.params.funder.toHex()
  fundingToken.fundingvalue = event.params.value
  fundingToken.tenor = event.params.tenor
  fundingToken.save()
}
