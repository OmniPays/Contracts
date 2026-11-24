use crate::error::AggregatorError as AggregatorErrorFromCrate;
use crate::test::SoroswapAggregatorTest;

use super::soroswap_aggregator_contract::{AggregatorError, Protocol};

#[test]
fn test_remove_adapter() {
    let test = SoroswapAggregatorTest::setup();

    assert_eq!(test.aggregator_contract.get_adapters().len(), 4);

    test.aggregator_contract.remove_adapter(&Protocol::Soroswap);

    assert_eq!(test.aggregator_contract.get_adapters().len(), 3);
    assert_eq!(
        test.aggregator_contract.try_get_paused(&Protocol::Soroswap),
        Err(Ok(AggregatorError::ProtocolNotFound))
    );
}

#[test]
fn test_remove_adapter_not_yet_initialized() {
    let test = SoroswapAggregatorTest::setup();

    let result = test
        .aggregator_contract_not_initialized
        .try_remove_adapter(&Protocol::Soroswap);

    assert_eq!(result, Err(Ok(AggregatorErrorFromCrate::NotInitialized)));
}

#[test]
fn test_remove_unknown_adapter_returns_error() {
    let test = SoroswapAggregatorTest::setup();

    test.aggregator_contract.remove_adapter(&Protocol::Soroswap);

    let result = test
        .aggregator_contract
        .try_remove_adapter(&Protocol::Soroswap);

    assert_eq!(result, Err(Ok(AggregatorError::ProtocolNotFound)));
}
