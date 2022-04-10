import React, { useState } from 'react'
import { FormattedMessage } from 'react-intl'
import { colors, Icon, IconName } from '@blockchain-com/constellation'
import { Field, reduxForm } from 'redux-form'
import styled from 'styled-components'

import { NftCollection } from '@core/network/api/nfts/types'
import { RemoteDataType } from '@core/types'
import { Icon as ComponentIcon, SpinningLoader, Text } from 'blockchain-info-components'
import { Form, NumberBox } from 'components/Form'
import { actions } from 'data'
import { media } from 'services/styles'

const Wrapper = styled.div<{ isOpen: boolean }>`
  top: 20px;
  position: sticky;
  transition: all 0.3s ease;
  padding: 0 10px;
  width: ${(props) => (props.isOpen ? '300px' : '20px')};
  margin-right: 20px;
  height: calc(100vh - 76px);
  overflow: scroll;
  ${media.tablet`
    display: none;
  `}
`
const IconWrapper = styled.div<{ isOpen: boolean }>`
  width: 100%;
  display: flex;
  justify-content: ${(props) => (props.isOpen ? 'flex-end' : 'center')};
`
const FilterHeader = styled.div<{ isOpen: boolean }>`
  display: flex;
  padding-bottom: 16px;
  border-bottom: ${(props) => (props.isOpen ? `1px solid ${props.theme.grey000}` : '')};
  margin-bottom: 24px;
`
const FilterHeaderText = styled(Text)<{ isOpen: boolean }>`
  display: ${(props) => (props.isOpen ? 'block' : 'none')};
`

const TraitWrapper = styled.div`
  margin-top: 8px;
  border-radius: 8px;
  border: 1px solid ${colors.grey100};
`

const TraitList = styled.div<{ isActive: boolean }>`
  transition: all 0.3s ease;
  max-height: ${(props) => (props.isActive ? '200px' : '0px')};
  overflow: auto;
`

const TraitHeader = styled.div`
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
`

const TraitItem = styled.div`
  border-bottom: 1px solid ${(props) => props.theme.grey000};
  box-sizing: border-box;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  &:first-child {
    border-top: 1px solid ${(props) => props.theme.grey000};
  }
  &:last-child {
    border-bottom: 0;
  }
`

const NftFilter: React.FC<Props> = ({ collection }) => {
  const [isOpen, setIsOpen] = useState(true)
  const [activeTraits, setActiveTraits] = useState<string[]>([])

  return (
    <Wrapper isOpen={isOpen}>
      <FilterHeader isOpen={isOpen}>
        <FilterHeaderText isOpen={isOpen} size='20px' weight={500} color='black'>
          <FormattedMessage defaultMessage='Filter' id='copy.filter' />
        </FilterHeaderText>
        <IconWrapper isOpen={isOpen}>
          {isOpen ? (
            <Icon
              cursor='pointer'
              name={IconName.CLOSE_CIRCLE_V2}
              color={colors.grey500}
              role='button'
              onClick={() => setIsOpen(false)}
            />
          ) : (
            <Icon
              cursor='pointer'
              name={IconName.FILTER}
              color={colors.grey500}
              role='button'
              onClick={() => setIsOpen(true)}
            />
          )}
        </IconWrapper>
      </FilterHeader>
      <Form>
        {collection.cata({
          Failure: () => (
            <Text size='12px' weight={500}>
              Error: You must select a collection!
            </Text>
          ),
          Loading: () => <SpinningLoader width='14px' height='14px' borderWidth='3px' />,
          NotAsked: () => <SpinningLoader height='14px' width='14px' borderWidth='3px' />,
          Success: (val) => (
            <div style={{ display: isOpen ? 'block' : 'none' }}>
              <FormattedMessage id='copy.buy_now' defaultMessage='Buy Now' />
              <div style={{ marginTop: '24px' }}>
                <Text style={{ marginBottom: '8px' }} size='14px' weight={600} color='black'>
                  <FormattedMessage id='copy.price' defaultMessage='Price' />
                </Text>
                <div style={{ alignItems: 'center', display: 'flex', gap: '12px' }}>
                  <Field name='min' component={NumberBox} placeholder='Min' />
                  <Field name='max' component={NumberBox} placeholder='Max' />
                  <ComponentIcon size='18px' name='ETH' />
                </div>
              </div>
              <div style={{ marginTop: '24px' }}>
                <Text size='14px' weight={600} color='black'>
                  <FormattedMessage id='copy.attributes' defaultMessage='Attributes' />
                </Text>
                {Object.keys(val.traits).map((trait) => {
                  const isActive = activeTraits.indexOf(trait) > -1

                  return (
                    <TraitWrapper key={trait}>
                      <TraitHeader
                        role='button'
                        onClick={() => {
                          if (activeTraits.indexOf(trait) === -1) {
                            setActiveTraits([...activeTraits, trait])
                          } else {
                            setActiveTraits(activeTraits.filter((t) => t !== trait))
                          }
                        }}
                      >
                        <Text size='14px' weight={500} color='black'>
                          {trait}
                        </Text>
                        <Icon
                          name={isActive ? IconName.CHEVRON_UP : IconName.CHEVRON_DOWN}
                          color={colors.grey400}
                        />
                      </TraitHeader>
                      <TraitList isActive={isActive}>
                        {Object.keys(val.traits[trait])
                          .sort((a, b) => (val.traits[trait][a] < val.traits[trait][b] ? 1 : -1))
                          .map((value) => {
                            return (
                              <TraitItem key={value}>
                                <div
                                  style={{ alignItems: 'center', display: 'flex', width: '100%' }}
                                >
                                  <Field
                                    component='input'
                                    name={`${trait}.${value}`}
                                    type='checkbox'
                                    id={`${trait}.${value}`}
                                  />
                                  <label
                                    htmlFor={`${trait}.${value}`}
                                    style={{
                                      alignItems: 'center',
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      whiteSpace: 'nowrap',
                                      width: '100%'
                                    }}
                                  >
                                    <Text
                                      style={{ marginLeft: '4px' }}
                                      size='12px'
                                      weight={600}
                                      color='black'
                                      capitalize
                                    >
                                      {value}
                                    </Text>
                                    <div style={{ alignItems: 'center', display: 'flex' }}>
                                      <Text size='12px' weight={500} color='grey500'>
                                        {val.traits[trait][value]}
                                      </Text>
                                      &nbsp;
                                      <Text size='12px' weight={500} color='grey500'>
                                        (
                                        {(
                                          (Number(val.traits[trait][value]) /
                                            Number(val.stats.total_supply)) *
                                          100
                                        ).toFixed(2)}
                                        %)
                                      </Text>
                                    </div>
                                  </label>
                                </div>
                              </TraitItem>
                            )
                          })}
                      </TraitList>
                    </TraitWrapper>
                  )
                })}
              </div>
            </div>
          )
        })}
      </Form>
    </Wrapper>
  )
}

type Props = {
  collection: RemoteDataType<string, NftCollection>
  formActions: typeof actions.form
}

export default NftFilter
