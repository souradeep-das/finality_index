use layer_wasi::{Reactor, Request, WasiPollable};
use serde::Deserialize;
use serde_json::json;

// Structure for Infura's JSON-RPC response
#[derive(Deserialize, Debug)]
pub struct InfuraResponse {
    pub jsonrpc: String,
    pub id: u32,
    pub result: String, // Hexadecimal data as a string
}

pub async fn get_btc_usd_price(reactor: &Reactor, infura_project_id: &str, x: u64) -> Result<Option<f32>, String> {
    // Convert `x` to a hexadecimal string, left-padded to 64 characters to fit EVM data format
    let x_hex = format!("{:064x}", x);

    // Construct the `data` field by appending `x_hex` to the function selector
    let data_field = format!("0x8e7cb6e1{}", x_hex);

    // Construct the JSON-RPC payload for the eth_call
    let request_payload = json!({
        "jsonrpc": "2.0",
        "method": "eth_call",
        "params": [
            {
                "to": "0x8Ff75b7E4217500C3497A5bb84C63075143c374c", // Replace with the actual contract address
                "data": data_field // Dynamic data field with `x`
            },
            "latest" // Use "latest" to refer to the latest block
        ],
        "id": 1
    });

    // Create the POST request to Infura
    let mut req = Request::post(&format!("https://sepolia.infura.io/v3/{}", infura_project_id))?;
    req.headers = vec![("Content-Type".to_string(), "application/json".to_string())]; // Set content type header
    req.body = request_payload.to_string().into_bytes();

    // Send the request to Infura and await the response
    let res = reactor.send(req).await?;
    println!("Response status: {}", res.status);

    match res.status {
        200 => {
            // Deserialize the Infura response
            let infura_response: InfuraResponse = res.json().map_err(|e| format!("Failed to deserialize response: {}", e))?;

            // Convert the hex string to u64 and then to f32 (if valid)
            let hex_value = &infura_response.result;
            if let Ok(parsed_value) = u64::from_str_radix(&hex_value.trim_start_matches("0x"), 16) {
                Ok(Some(parsed_value as f32))
            } else {
                Err("Failed to parse hex string".to_string())
            }
        }
        429 => Err("Rate limited, price unavailable".to_string()),
        status => Err(format!("Unexpected status code: {status}")),
    }
}
