#[allow(warnings)]
mod bindings;
use anyhow::anyhow;
use bindings::{Guest, Output, TaskQueueInput};

mod coin_gecko;

use layer_wasi::{block_on, Reactor};
use serde::{Deserialize, Serialize};

#[derive(Deserialize, Debug)]
pub struct TaskRequestData {
    pub x: u64,
}

#[derive(Serialize, Debug)]
pub struct TaskResponseData {
    pub x: u64,
    pub y: f32,
}

struct Component;

impl Guest for Component {
    fn run_task(request: TaskQueueInput) -> Output {
        // Deserialize input from JSON
        let TaskRequestData { x } = serde_json::from_slice(&request.request)
            .map_err(|e| anyhow!("Could not deserialize input request from JSON: {}", e))
            .unwrap();

        // Call the async function in a blocking manner, using a closure to pass in Reactor
        let y = block_on(|reactor: Reactor| async move {
            get_avg_btc(&reactor, x).await
        }).unwrap();        

        // Print the result
        println!("{} -> {}", x, y);

        // Serialize output to JSON, including both x and y
        Ok(serde_json::to_vec(&TaskResponseData { x, y })
            .map_err(|e| anyhow!("Could not serialize output data into JSON: {}", e))
            .unwrap())
    }
}

/// Record the latest BTCUSD price and return the JSON serialized result to write to the chain.
async fn get_avg_btc(reactor: &Reactor, x: u64) -> Result<f32, String> {
    let api_key = std::env::var("API_KEY").or(Err("missing env var `API_KEY`".to_string()))?;
    let price = coin_gecko::get_btc_usd_price(reactor, &api_key, x)
        .await
        .map_err(|err| err.to_string())?
        .ok_or("Invalid response from CoinGecko API")?;

    Ok(price)
}


/// The returned result.
#[derive(Serialize, Debug)]
#[serde(rename_all = "camelCase")]
struct CalculatedPrices {
    price: String,
}

impl CalculatedPrices {
    /// Serialize to JSON.
    fn to_json(&self) -> Result<Vec<u8>, String> {
        serde_json::to_vec(&self).map_err(|err| err.to_string())
    }
}

bindings::export!(Component with_types_in bindings);
