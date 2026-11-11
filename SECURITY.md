# Security policy

Safe Mark Doc handles sensitive documents (ID cards, contracts, invoices) entirely in the browser. Reports that help keep them private are very welcome.

## Supported versions

Only the latest release (the newest `x.y.z` tag) gets security fixes. It is the version deployed to GitHub Pages and published as the `x.y.z`, `x.y` and `x` [container images](README.md#container-images); fixes reach the `latest` image first, as it follows `master`.

## Reporting a vulnerability

Please report vulnerabilities privately through GitHub: open the **Security** tab of this repository and choose **Report a vulnerability**. Do not open a public issue or pull request for a security problem.

A useful report includes:

- what an attacker can achieve and under which conditions;
- steps to reproduce it, with the app version (shown in the footer) and the browser;
- a sample file if one is needed, such as a crafted PDF or image (with no real personal data).

## What to expect

This is a personal project maintained in spare time, so replies are best effort: an acknowledgement usually within a week, then updates in the private advisory until the issue is fixed or ruled out. Once a fix is released, the advisory is published, crediting the reporter if they wish.

## Scope

In scope:

- a document, or anything else the app reads, that runs code in the app or sends data out of the device despite the [Content Security Policy](README.md#content-security-policy);
- exported files that carry data from the original beyond the visible pixels (text layers, metadata, the original file name when not asked to keep it);
- redacted areas that can be recovered from the exported file;
- data stored by the app (preferences, copy log, shared files) that outlives what the README promises or leaks to other sites;
- the container image and its nginx configuration (headers, permissions, files served).

Out of scope:

- vulnerabilities already public in pdf.js or another dependency: please report them upstream. A report that the bundled version is affected and needs an update is still welcome;
- removing or retouching a watermark by editing the image. A visible watermark makes misuse of a copy harder and traceable, not impossible;
- attacks that need a compromised device or browser, or physical access to an unlocked one;
- missing hardening with no practical impact.
