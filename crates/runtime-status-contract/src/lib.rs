use serde_json::Value;
use std::fs;
use std::path::{Path, PathBuf};

const REQUIRED_FIELDS: &[&str] = &[
    "runtimeId",
    "rendererGraphEpoch",
    "graphStatus",
    "authoritativeWindowId",
    "liveTabCount",
    "liveLeafCount",
    "runtimeProtocolVersion",
    "minCompatibleRuntimeClientVersion",
    "capabilities",
    "hostPlatform",
];

fn repository_root() -> PathBuf {
    Path::new(env!("CARGO_MANIFEST_DIR"))
        .ancestors()
        .nth(2)
        .expect("runtime-status-contract crate must live under crates/")
        .to_path_buf()
}

fn load_json(relative_path: &str) -> Value {
    let path = repository_root().join(relative_path);
    let source = fs::read_to_string(&path)
        .unwrap_or_else(|error| panic!("failed to read {}: {error}", path.display()));

    serde_json::from_str(&source)
        .unwrap_or_else(|error| panic!("failed to parse {}: {error}", path.display()))
}

fn missing_runtime_status_fields(value: &Value) -> Vec<&'static str> {
    REQUIRED_FIELDS
        .iter()
        .copied()
        .filter(|field| value.get(field).is_none())
        .collect()
}

pub fn validate_runtime_status_sample(relative_path: &str) -> Result<(), Vec<&'static str>> {
    let value = load_json(relative_path);
    let missing_fields = missing_runtime_status_fields(&value);

    if missing_fields.is_empty() {
        Ok(())
    } else {
        Err(missing_fields)
    }
}

#[cfg(test)]
mod tests {
    use super::validate_runtime_status_sample;

    #[test]
    fn accepts_the_checked_in_valid_runtime_status_sample() {
        assert_eq!(
            validate_runtime_status_sample("src/shared/runtime-status-contract-valid-sample.json"),
            Ok(())
        );
    }

    #[test]
    fn rejects_the_checked_in_invalid_runtime_status_sample() {
        assert_eq!(
            validate_runtime_status_sample(
                "src/shared/runtime-status-contract-invalid-sample.json"
            ),
            Err(vec!["runtimeId"])
        );
    }
}
