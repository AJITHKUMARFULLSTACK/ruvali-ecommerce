import React from 'react';
import InfoPage from '../../components/InfoPage/InfoPage';

const SizeGuide = () => (
  <InfoPage title="Size Guide">
    <h2>How to Measure</h2>
    <p>
      Use a soft measuring tape. Measure over undergarments and keep the tape
      snug but not tight.
    </p>

    <h2>Women's Sizes (inches)</h2>
    <table className="info-table">
      <thead>
        <tr>
          <th>Size</th>
          <th>Bust</th>
          <th>Waist</th>
          <th>Hips</th>
        </tr>
      </thead>
      <tbody>
        <tr><td>S</td><td>32-34</td><td>26-28</td><td>35-37</td></tr>
        <tr><td>M</td><td>34-36</td><td>28-30</td><td>37-39</td></tr>
        <tr><td>L</td><td>36-38</td><td>30-32</td><td>39-41</td></tr>
        <tr><td>XL</td><td>38-40</td><td>32-34</td><td>41-43</td></tr>
      </tbody>
    </table>

    <h2>Men's Sizes (inches)</h2>
    <table className="info-table">
      <thead>
        <tr>
          <th>Size</th>
          <th>Chest</th>
          <th>Waist</th>
          <th>Hip</th>
        </tr>
      </thead>
      <tbody>
        <tr><td>S</td><td>34-36</td><td>28-30</td><td>35-37</td></tr>
        <tr><td>M</td><td>38-40</td><td>30-32</td><td>37-39</td></tr>
        <tr><td>L</td><td>42-44</td><td>32-34</td><td>39-41</td></tr>
        <tr><td>XL</td><td>44-46</td><td>34-36</td><td>41-43</td></tr>
      </tbody>
    </table>

    <h2>Footwear</h2>
    <p>
      UK sizes 5–11 correspond to EU 38–45. Measure your foot length and refer
      to the product page for specific fit notes.
    </p>
  </InfoPage>
);

export default SizeGuide;
